import { useEffect, useState } from "react"
import { toast } from "sonner"

import { messages } from "~/src/i18n"
import { WebDAVRegistry } from "~src/providers"
import {
  addCustomVendorToConfig,
  loadCustomVendorsFromConfig,
  removeCustomVendorFromConfig,
  useSettingsStore
} from "~src/store"
import { type CustomVendorConfig } from "~src/types"
import { confirm } from "~src/utils"

import Button from "./Button"
import Input from "./Input"

/**
 * Component for managing custom WebDAV vendor configurations.
 *
 * Displays all available vendors (preset + custom) and provides UI
 * for registering new custom vendors or removing existing ones.
 *
 * @returns A JSX element rendering the vendor management interface
 */
const WebDavVendorManager = () => {
  const config = useSettingsStore((state) => state.config)
  const saving = useSettingsStore((state) => state.saving)
  const updateConfig = useSettingsStore((state) => state.updateConfig)
  const persistConfig = useSettingsStore((state) => state.persistConfig)
  // Form state for registering a new custom vendor.
  const [vendorForm, setVendorForm] = useState<CustomVendorConfig>({
    id: "",
    name: "",
    serverUrl: ""
  })
  useEffect(() => {
    // Load custom vendors on component mount
    if (config) loadCustomVendorsFromConfig(config)
  }, [config])

  /**
   * All available vendors with type annotations.
   *
   * Combines preset vendors and custom vendors into a single array.
   */
  const allAvailableVendors = [
    ...WebDAVRegistry.getPresetVendors().map((v) => ({ ...v, type: "preset" })),
    ...WebDAVRegistry.getCustomVendors().map((v) => ({ ...v, type: "custom" }))
  ]

  /**
   * Add a new custom vendor to the configuration.
   *
   * Validates form inputs, registers the vendor, updates config,
   * and resets the form on success.
   */
  const handleAddVendor = () => {
    const { id, name, serverUrl } = vendorForm
    if (!id || !name || !serverUrl)
      return void toast(messages.alert.incompleteInfo())
    try {
      const current = useSettingsStore.getState().config
      const newVendors = addCustomVendorToConfig(current, vendorForm)
      updateConfig((draft) => {
        draft.customVendors = newVendors
      })
      persistConfig()
      setVendorForm({ id: "", name: "", serverUrl: "" })
      toast(messages.alert.vendorRegistered(name))
    } catch (e) {
      toast(messages.alert.vendorFailed(String(e)))
    }
  }

  /**
   * Remove a custom vendor from the configuration by ID.
   *
   * Prompts for confirmation before removing the vendor.
   *
   * @param id - Vendor ID to remove
   */
  const handleDeleteVendor = async (id: string) => {
    if (!(await confirm(messages.confirm.deleteVendor()))) return
    try {
      const current = useSettingsStore.getState().config
      const newVendors = removeCustomVendorFromConfig(current, id)
      updateConfig((draft) => {
        draft.customVendors = newVendors
      })
      persistConfig()
      toast(messages.alert.vendorDeleted())
    } catch (e) {
      toast(messages.alert.vendorDeleteFailed(String(e)))
    }
  }

  return (
    <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-50">
        {/* Icon container */}
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 font-mono">
          {messages.ui.vendorManager()}
        </h3>
      </div>

      {/* Vendor list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allAvailableVendors.map((v) => (
          <div
            key={v.id}
            className="flex flex-col p-3 bg-slate-50 border border-slate-100 rounded-lg group relative">
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-bold text-slate-700 font-mono">
                {v.name}
              </span>
              {/* Badge: preset vs custom */}
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                  v.type === "preset"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}>
                {v.type === "preset" ? "Official" : "Custom"}
              </span>
            </div>

            {/* Server URL display */}
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {v.serverUrl}
            </div>

            {/* Delete button for custom vendors */}
            {v.type === "custom" && (
              <button
                onClick={() => handleDeleteVendor(v.id)}
                className="absolute top-3 right-16 opacity-0 group-hover:opacity-100 text-[10px] text-red-400 hover:text-red-600 transition-all cursor-pointer font-mono">
                [{messages.ui.remove()}]
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Register new vendor form */}
      <div className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          {/* Input for the id of new vendor registration */}
          <Input
            label={messages.ui.vendorId()}
            value={vendorForm.id}
            onChange={(val) => setVendorForm({ ...vendorForm, id: val })}
            placeholder="my-server"
          />

          {/* Input for the name of new vendor registration */}
          <Input
            label={messages.ui.displayName()}
            value={vendorForm.name}
            onChange={(val) => setVendorForm({ ...vendorForm, name: val })}
            placeholder={messages.ui.vendorPlaceholder()}
          />
        </div>

        {/* Input for the server URL of new vendor registration */}
        <Input
          label={messages.ui.serverUrl()}
          value={vendorForm.serverUrl}
          onChange={(val) => setVendorForm({ ...vendorForm, serverUrl: val })}
          placeholder="https://dav.example.com/dav"
        />

        {/* Button to save and register the new vendor */}
        <Button
          label={messages.ui.saveVendor()}
          onClick={handleAddVendor}
          loading={saving}
          className="bg-white border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
        />
      </div>
    </section>
  )
}

export default WebDavVendorManager
