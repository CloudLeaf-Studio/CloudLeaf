import type { PlasmoMessaging } from "@plasmohq/messaging"

import { syncMutex } from "~background/scheduler"
import { buildProviders, uploadBookmarks } from "~core/sync"
import { getSyncState, setSyncState } from "~store"
import type { SyncUploadRequest, SyncUploadResponse } from "~types"
import { actionApi } from "~utils"

/**
 * Handle sync upload message from UI.
 *
 * Runs inside the sync mutex, uploads bookmarks and updates
 * baseline state after successful uploads.
 */
const handler: PlasmoMessaging.MessageHandler<
  SyncUploadRequest,
  SyncUploadResponse
> = async (req, res) => {
  await syncMutex.runExclusive(async () => {
    const { localSnapshot } = req.body
    const result = await uploadBookmarks(localSnapshot)

    if (result.ok) {
      const state = await getSyncState()
      const { providers } = await buildProviders(true)

      if (providers.length > 0) {
        const currentKey = providers[0].provider.getTargetKey()
        state.baseline = {
          targetKey: currentKey,
          contentHash: localSnapshot.contentHash,
          updatedAt: localSnapshot.updatedAt
        }
        state.phase = "ready"
        state.localUpdatedAt = localSnapshot.updatedAt
        await setSyncState(state)
        actionApi.setBadgeText({ text: "" })
      }
    }

    res.send(result)
  })
}

export default handler
