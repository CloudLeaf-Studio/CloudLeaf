import type { PlasmoMessaging } from "@plasmohq/messaging"

import { applyingCloud, syncMutex } from "~background/scheduler"
import { reconcileSync } from "~core/sync"
import type { TriggerSyncRequest, TriggerSyncResponse } from "~types"

/**
 * Handle manual sync trigger from UI.
 */
const handler: PlasmoMessaging.MessageHandler<
  TriggerSyncRequest,
  TriggerSyncResponse
> = async (req, res) => {
  try {
    await reconcileSync(syncMutex, applyingCloud)
    res.send({ ok: true })
  } catch (e) {
    res.send({ ok: false, error: String(e) })
  }
}

export default handler
