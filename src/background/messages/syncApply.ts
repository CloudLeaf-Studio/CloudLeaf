import type { PlasmoMessaging } from "@plasmohq/messaging"

import { applyingCloud, syncMutex } from "~background/scheduler"
import { setBookmarks } from "~core/bookmark"
import { buildProviders, withCloudApply } from "~core/sync"
import { getSyncState, setSyncState } from "~store"
import type { SyncApplyRequest, SyncApplyResponse } from "~types"
import { actionApi } from "~utils"

/**
 * Handle sync apply message from UI.
 *
 * Runs inside the sync mutex, writes the provided payload to local
 * bookmarks and updates baseline state.
 */
const handler: PlasmoMessaging.MessageHandler<
  SyncApplyRequest,
  SyncApplyResponse
> = async (req, res) => {
  const { payload } = req.body

  await syncMutex.runExclusive(async () => {
    try {
      await withCloudApply(applyingCloud, () => setBookmarks(payload))

      const state = await getSyncState()
      const { providers } = await buildProviders(true)
      if (providers.length > 0) {
        state.baseline = {
          targetKey: providers[0].provider.getTargetKey(),
          contentHash: payload.contentHash,
          updatedAt: payload.updatedAt
        }
        state.phase = "ready"
        state.localUpdatedAt = payload.updatedAt
        await setSyncState(state)
        actionApi.setBadgeText({ text: "" })
      }

      res.send({ ok: true })
    } catch (e) {
      res.send({ ok: false, error: String(e) })
    }
  })
}

export default handler
