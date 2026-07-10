import { useEffect, useState } from "react"

import { messages } from "~/src/i18n"
import { DEFAULT_FILENAME } from "~src/constants"
import { useSettingsStore } from "~src/store"
import type { GistConfig } from "~src/types"

import Button from "./Button"
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
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
        {/* Header with GitHub icon and title */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {messages.ui.gistConfig()}
          </h3>
        </div>

        {/* Buttons to cancel editing and reset configuration */}
        <div className="flex items-center gap-3">
          {/* Button to cancel editing */}
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            {messages.ui.cancel()}
          </button>

          {/* Button to reset Gist configuration */}
          {gist && (
            <button
              onClick={handleReset}
              className="text-xs text-red-400 hover:text-red-600 transition-colors">
              {messages.ui.resetConfig()}
            </button>
          )}
        </div>
      </div>

      {/* Gist configuration inputs */}
      {/* Input for Access Token */}
      <div className="space-y-5">
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
    </section>
  )
}

export default GistSettings
