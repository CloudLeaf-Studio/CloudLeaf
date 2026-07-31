import { useEffect, useState } from "react"

import { DEFAULT_FILENAME } from "~constants"
import { messages } from "~i18n"
import { useSettingsStore } from "~store"
import type { GistConfig } from "~types"

import Button from "./Button"
import Card from "./Card"
import Input from "./Input"

/**
 * Props for the `GistSettings` component.
 */
interface GistSettingsProps {
  /**
   * Close the Gist settings panel
   */
  onClose: () => void
}

/**
 * Gist settings component.
 *
 * Uses Zustand store for state management - no more props drilling!
 *
 * @param props - Gist settings properties
 *
 * @returns A JSX element rendering Gist settings inputs and save button
 */
const GistSettings = ({ onClose }: GistSettingsProps) => {
  // Get config and actions from store
  const gistConfig = useSettingsStore((state) => state.config?.gist)
  const saving = useSettingsStore((state) => state.saving)
  const updateConfig = useSettingsStore((state) => state.updateConfig)
  const persistConfig = useSettingsStore((state) => state.persistConfig)

  // Local form state
  const [gist, setGist] = useState<GistConfig | null>(null)

  // Default Gist config for new entries
  const DEFAULT_GIST: GistConfig = {
    accessToken: "",
    gistId: "",
    fileName: DEFAULT_FILENAME,
    enabled: true,
    priority: 0
  }

  useEffect(() => {
    setGist(gistConfig || null)
  }, [])

  /**
   * Handle changes to a specific Gist configuration field.
   *
   * @param field - Field name in `GistConfig` to update
   * @param value - New value for the specified field
   */
  const handleChange = (
    field: keyof GistConfig,
    value: string | boolean | number
  ) => {
    setGist((current) => ({
      ...(current || DEFAULT_GIST),
      [field]: value
    }))
  }

  /**
   * Reset Gist configuration
   */
  const handleReset = () => {
    setGist(null)
  }

  /**
   * Save Gist configuration to store
   */
  const handleSave = async () => {
    if (!gist) return
    updateConfig((draft) => {
      draft.gist = gist
    })
    await persistConfig()
    onClose()
  }

  return (
    <Card
      icon="github"
      title={messages.ui.gistConfig()}
      onCancel={onClose}
      onReset={gist ? handleReset : undefined}>
      {/* Gist configuration inputs */}
      {/* Input for Access Token */}
      <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-4">
        <Input
          label="Access Token"
          value={gist?.accessToken || ""}
          onChange={(val) => handleChange("accessToken", val)}
          type="password"
          placeholder="ghp_xxxxxxxxxxxx"
        />

        {/* Input for Gist ID */}
        <Input
          label="Gist ID"
          value={gist?.gistId || ""}
          onChange={(val) => handleChange("gistId", val)}
          placeholder={messages.ui.gistIdPlaceholder()}
        />

        {/* Input for Filename */}
        <Input
          label={messages.ui.filename()}
          type="text"
          value={gist?.fileName || ""}
          onChange={(val) => handleChange("fileName", val || DEFAULT_FILENAME)}
          placeholder={DEFAULT_FILENAME}
        />

        {/* Save configuration button */}
        <div className="pt-2">
          <Button
            label={messages.ui.saveGist()}
            loading={saving}
            onClick={handleSave}
            className="bg-white border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
          />
        </div>
      </div>
    </Card>
  )
}

export default GistSettings
