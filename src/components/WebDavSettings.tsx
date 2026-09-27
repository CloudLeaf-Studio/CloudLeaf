import { useEffect, useState } from "react"
import { toast } from "sonner"

import { DEFAULT_WEBDAV_FILEPATH } from "~constants"
import { messages } from "~i18n"
import { WebDAVRegistry } from "~providers"
import { loadCustomVendorsFromConfig, useSettingsStore } from "~store"
import type { WebDAVUserConfig } from "~types"

import Button from "./Button"
import Card from "./Card"
import Input from "./Input"
import Select from "./Select"

/**
 * Props for the `WebDavSettings` component.
 *
 * Represents the current user configuration and an update callback.
 */
interface WebDavSettingsProps {
  /**
   * Edit mode or add mode (default: add)
   */
  mode?: "add" | "edit"
  /**
   * When editing, the index in webDavConfigs to edit
   */
  editingIndex?: number | null
  /**
   * Close the WebDAV settings panel
   */
  onClose: () => void
}

/**
 * Component for managing WebDAV account configurations.
 *
 * Allows users to add new WebDAV accounts by providing vendor, credentials,
 * and file path information.
 *
 * @param props - WebDavSettings component properties
 *
 * @returns A JSX element rendering the WebDAV account form
 */
const WebDavSettings = ({
  mode = "add",
  editingIndex = null,
  onClose
}: WebDavSettingsProps) => {
  // Store state & actions
  const webDavConfigs = useSettingsStore((state) => state.config.webDavConfigs)
  const updateWebDavConfigs = useSettingsStore(
    (state) => state.updateWebDavConfigs
  )
  const getNextPriority = useSettingsStore((state) => state.getNextPriority)

  // Form state for adding a new WebDAV account.
  const [form, setForm] = useState<WebDAVUserConfig>({
    vendorId: "jianguoyun",
    username: "",
    password: "",
    filePath: DEFAULT_WEBDAV_FILEPATH,
    enabled: true,
    priority: Number.MAX_SAFE_INTEGER
  })

  // Load custom vendors from config on mount and when config changes
  useEffect(() => {
    const initial = useSettingsStore.getState().config
    if (initial) loadCustomVendorsFromConfig(initial)

    const unsub = useSettingsStore.subscribe((state, prev) => {
      if (state.config !== prev.config && state.config) {
        loadCustomVendorsFromConfig(state.config)
      }
    })
    return unsub
  }, [])

  // initial form
  useEffect(() => {
    if (!webDavConfigs) return
    if (mode === "edit" && editingIndex != null && editingIndex >= 0) {
      const existing = webDavConfigs[editingIndex]
      if (existing) {
        setForm({ ...existing })
      }
    } else {
      setForm({
        vendorId: "jianguoyun",
        username: "",
        password: "",
        filePath: DEFAULT_WEBDAV_FILEPATH,
        enabled: true,
        priority: Number.MAX_SAFE_INTEGER
      })
    }
  }, [])

  /**
   * All available vendors (built-in + custom).
   */
  const vendors = WebDAVRegistry.getAllVendors().map((v) => ({
    label: v.name,
    value: v.id
  }))

  /**
   * Add a new WebDAV account to the configuration.
   *
   * Validates form inputs, assigns next priority, updates config,
   * and resets username/password fields.
   */
  const handleSubmit = async () => {
    if (!form.username || !form.password)
      return void toast(messages.alert.incompleteInfo())
    if (mode === "add") {
      const priority = await getNextPriority()
      updateWebDavConfigs((draft) => {
        draft.push({ ...form, priority })
      })
      toast(messages.alert.settingsSaved())
      onClose()
    } else {
      if (editingIndex == null || editingIndex < 0) return
      updateWebDavConfigs((draft) => {
        if (!draft[editingIndex]) return
        draft[editingIndex] = {
          ...form,
          priority: draft[editingIndex].priority
        }
      })
      toast(messages.alert.settingsSaved())
      onClose()
    }
  }

  return (
    <Card
      icon="webdav"
      title={
        mode === "edit" ? messages.ui.webdavEdit() : messages.ui.webdavAdd()
      }
      onCancel={onClose}>
      {/* Add account form */}
      <div className="p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 space-y-4">
        {/* Vendor and username inputs */}
        <div className="grid grid-cols-2 gap-4">
          {/* Vendor select */}
          <Select
            label={messages.ui.selectVendor()}
            value={form.vendorId}
            options={vendors}
            onChange={(val) => {
              setForm({ ...form, vendorId: val })
            }}
          />

          {/* Username input */}
          <Input
            label={messages.ui.username()}
            value={form.username}
            onChange={(val) => {
              setForm({ ...form, username: val })
            }}
            placeholder="Account Email"
          />
        </div>

        {/* Password and file path inputs */}
        <Input
          label={messages.ui.appPassword()}
          value={form.password}
          type="password"
          onChange={(val) => {
            setForm({ ...form, password: val })
          }}
          placeholder="App Password"
        />

        {/* File path input */}
        <Input
          label={messages.ui.filePath()}
          value={form.filePath}
          onChange={(val) => {
            setForm({ ...form, filePath: val || DEFAULT_WEBDAV_FILEPATH })
          }}
          placeholder={DEFAULT_WEBDAV_FILEPATH}
        />

        {/* Add account button */}
        <Button
          label={
            mode === "edit"
              ? messages.ui.saveChanges()
              : messages.ui.addWebdav()
          }
          onClick={handleSubmit}
          className="bg-white border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900"
        />
      </div>
    </Card>
  )
}

export default WebDavSettings
