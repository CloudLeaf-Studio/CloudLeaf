import { useEffect, useState } from "react"
import { Toaster } from "sonner"

import { messages } from "~/src/i18n"
import {
  GistSettings,
  Sources,
  WebDavSettings,
  WebDavVendorManager
} from "~src/components"
import { useSettingsStore } from "~src/store"
import { type Editor } from "~src/types"

import "./index.css"

/**
 * Options page component for CloudLeaf extension.
 *
 * Provides the main settings interface where users can manage sync sources,
 * configure Gist and WebDAV accounts, and customize cloud vendor settings.
 *
 * Uses Zustand store for centralized state management.
 *
 * @returns A JSX element rendering the full options page
 */
function OptionsPage() {
  // Get loading state from store
  const initializing = useSettingsStore((state) => state.initializing)
  const loadConfig = useSettingsStore((state) => state.loadConfig)

  // Local UI state for editor panel
  const [editor, setEditor] = useState<null | Editor>(null)

  useEffect(() => {
    // Load user configuration on mount
    loadConfig()
  }, [loadConfig])

  // fix page title localization
  useEffect(() => {
    const localizedTitle = chrome.i18n.getMessage("extension_displayName")
    document.title = localizedTitle
  }, [])

  // Loading state UI
  if (initializing)
    return <div className="p-20 text-slate-400">{messages.ui.loading()}</div>

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Page header */}
        <header>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {messages.ui.settingsTitle()}
          </h1>
        </header>

        {/* Main content sections */}
        <main className="space-y-6">
          {/* Sync sources management */}
          <Sources onOpenEditor={(opts) => setEditor(opts)} />

          {/* Inline editor panel: Gist or WebDAV */}
          {editor?.type === "gist" && (
            <GistSettings onClose={() => setEditor(null)} />
          )}

          {/* WebDAV account editor/add section (conditional) */}
          {editor?.type === "webdav" && (
            <WebDavSettings
              mode={editor.mode}
              editingIndex={editor.index ?? null}
              onClose={() => setEditor(null)}
            />
          )}

          {/* WebDAV vendor management section */}
          <WebDavVendorManager />
        </main>
      </div>

      {/* Toaster for notifications */}
      <Toaster richColors position="top-center" />
    </div>
  )
}

export default OptionsPage
