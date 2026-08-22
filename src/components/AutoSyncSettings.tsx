import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import { messages } from "~i18n"
import { getSyncState, useSettingsStore } from "~store"
import type { SyncPhase, TriggerSyncRequest, TriggerSyncResponse } from "~types"
import { consolo } from "~utils"

import Button from "./Button"
import Card from "./Card"
import Switch from "./Switch"

/**
 * Auto-sync settings section with toggle and manual trigger.
 *
 * @returns A JSX element rendering the auto-sync configuration panel
 */
const AutoSyncSettings = () => {
  const autoSync = useSettingsStore(
    (state) => state.config.sync?.autoSyncEnabled ?? false
  )
  const updateConfig = useSettingsStore((state) => state.updateConfig)
  /**
   * Current sync phase, or null if auto-sync is disabled.
   */
  const [phase, setPhase] = useState<SyncPhase | null>(null)
  /**
   * Whether a manual sync trigger is currently in progress.
   */
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (autoSync) {
      getSyncState().then((s) => setPhase(s.phase))
    } else {
      setPhase(null)
    }
  }, [autoSync])

  /**
   * Toggle auto-sync on/off and persist the change.
   *
   * @param val - New enabled state
   */
  const handleToggle = (val: boolean) => {
    updateConfig((draft) => {
      draft.sync = { ...draft.sync, autoSyncEnabled: val }
    })
  }

  /**
   * Trigger an immediate sync cycle via background service worker.
   *
   * @returns A promise that resolves when the trigger completes
   */
  const handleTriggerSync = async () => {
    setSyncing(true)
    try {
      const res = await sendToBackground<
        TriggerSyncRequest,
        TriggerSyncResponse
      >({ name: "triggerSync" })
      // TODO: Maybe there is an error which should be handled, but for now we just log it to the console.
      if (res.ok === false) {
        consolo
          .withTag("components/AutoSyncSettings")
          .info("Failed to trigger sync", res.error)
      }
      const state = await getSyncState()
      setPhase(state.phase)
    } catch {
      // ignore
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      {/* Auto-sync toggle */}
      <Switch
        label={messages.ui.autoSync()}
        enabled={autoSync}
        onChange={handleToggle}
      />

      {/* Sync phase and manual trigger */}
      {autoSync && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
          <span className="text-sm text-slate-600 font-mono">
            {phase ? messages.ui.syncPhase(phase) : "--"}
          </span>
          <Button
            label={syncing ? messages.ui.syncing() : messages.ui.triggerSync()}
            onClick={handleTriggerSync}
            loading={syncing}
            className="w-auto! py-1 px-3 text-xs"
          />
        </div>
      )}
    </Card>
  )
}

export default AutoSyncSettings
