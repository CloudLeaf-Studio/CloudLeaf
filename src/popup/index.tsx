import packageInfo from "package.json"
import { useEffect, useState } from "react"
import { toast, Toaster } from "sonner"

import { messages } from "~/src/i18n"
import { Button } from "~src/components"
import { COUNT_KEY } from "~src/constants"
import { setBookmarks } from "~src/core/bookmark"
import { useSync } from "~src/hooks"
import { getCount } from "~src/store"
import { type BookmarkCountCache } from "~src/types"
import { confirm, consolo, isFirefox } from "~src/utils"

import "./index.css"

/**
 * Popup page component for CloudLeaf extension.
 *
 * Provides quick access to upload and download bookmarks, with automatic
 * conflict detection and resolution prompts.
 *
 * @returns A JSX element rendering the popup interface
 */
function IndexPopup() {
  // fix page title localization
  useEffect(() => {
    const localizedTitle = chrome.i18n.getMessage("extension_displayName")
    document.title = localizedTitle
  }, [])

  const [localCount, setLocalCount] = useState<number | null>(null)
  const [cloudCount, setCloudCount] = useState<number | null>(null)

  // Fetch bookmark counts from storage and listen for changes
  useEffect(() => {
    getCount().then((cache) => {
      setLocalCount(cache.local)
      setCloudCount(cache.cloud)
    })

    /**
     * Listen for changes in chrome.storage and update counts accordingly.
     *
     * @param change - An object containing the changes in storage.
     * @param areaName - The name of the storage area that changed (e.g., "local").
     */
    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== "local") return
      if (changes[COUNT_KEY]) {
        const v = changes[COUNT_KEY].newValue as BookmarkCountCache | undefined
        if (v) {
          if (v.local !== undefined) setLocalCount(v.local)
          if (v.cloud !== undefined) setCloudCount(v.cloud)
        }
      }
    }

    chrome.storage.onChanged.addListener(onChanged)
    return () => chrome.storage.onChanged.removeListener(onChanged)
  }, [])

  // Sync operations and state from useSync hook
  const {
    loading,
    performUpload,
    performDownload,
    performExport,
    performImport
  } = useSync()
  /**
   * Extension version from package.json.
   */
  const version = packageInfo.version

  /**
   * Open the extension's options page.
   */
  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  /**
   * Handle bookmark upload with conflict detection.
   *
   * Checks sync status and prompts user if cloud data is newer,
   * allowing force upload if confirmed.
   */
  const handleUpload = async () => {
    consolo.withTag("popup").info("Starting upload...")
    const result = await performUpload()
    if (!result.ok) {
      toast(
        messages.alert.uploadFailed(
          result.error || messages.error.unknownError()
        )
      )
      return
    }
    // status === 'behind' means cloud data is newer
    if (result.data.status === "behind") {
      if (await confirm(messages.confirm.forceUpload())) {
        await performUpload(true, result.data.payload)
        consolo
          .withTag("popup")
          .info(`Force uploaded to providers after conflict detected.`)
        toast(messages.alert.forceUploadSuccess())
      }
      // status === 'none' means no provider configured
    } else if (result.data.status === "none") {
      toast(messages.alert.noProvider())
      // Normal case: upload succeeded without conflicts
    } else {
      await performUpload(true, result.data.payload)
      consolo.withTag("popup").info(`Successfully uploaded to providers.`)
      toast(messages.alert.uploadSuccess())
    }
  }

  /**
   * Handle bookmark download with conflict detection.
   *
   * Checks sync status and prompts user if local data is newer,
   * allowing force download if confirmed.
   */
  const handleDownload = async () => {
    const result = await performDownload()
    if (!result.ok) {
      toast(
        messages.alert.downloadFailed(
          result.error || messages.error.unknownError()
        )
      )
      return
    }
    // status === 'ahead' means local data is newer
    if (result.data.status === "ahead") {
      if (await confirm(messages.confirm.forceDownload())) {
        await setBookmarks(result.data.payload)
        toast(messages.alert.forceDownloadSuccess())
      }
      // status === 'none' means no provider configured
    } else if (result.data.status === "none") {
      toast(messages.alert.noProvider())
      // Normal case: download succeeded without conflicts
    } else {
      await setBookmarks(result.data.payload)
      toast(messages.alert.downloadSuccess())
    }
  }

  /**
   * Handle bookmark export to local file.
   */
  const handleExport = async () => {
    const result = await performExport()
    if (!result.ok) {
      toast(
        messages.alert.exportFailed(
          result.error || messages.error.unknownError()
        )
      )
      return
    }
    toast(messages.alert.exportSuccess())
  }

  /**
   * Handle bookmark import from local file.
   *
   * Checks sync status and prompts user if local data is newer,
   * allowing force import if confirmed.
   */
  const handleImport = async () => {
    const result = await performImport()
    if (!result.ok) {
      consolo.withTag("popup").error(`Import failed: ${result.error}`)
      toast(
        messages.alert.importFailed(
          result.error || messages.error.unknownError()
        )
      )
      return
    }
    if (result.data.status === "ahead") {
      if (await confirm(messages.confirm.forceImport())) {
        await setBookmarks(result.data.payload)
        toast(messages.alert.forceImportSuccess())
      }
    } else {
      await setBookmarks(result.data.payload)
      toast(messages.alert.importSuccess())
    }
  }

  /**
   * Handle opening the side panel to preview cloud bookmarks.
   */
  const handleOpenPreview = async () => {
    try {
      consolo.withTag("popup").info("Opening side panel for preview...")
      if (isFirefox) await browser.sidebarAction.open()
      else {
        const window = await chrome.windows.getCurrent()
        await chrome.sidePanel.open({ windowId: window.id })
      }
    } catch (error) {
      consolo.withTag("popup").error("Failed to open side panel:", error)
    }
  }

  return (
    <div className="w-60 p-3 bg-white flex flex-col gap-3">
      {/* Header */}
      <header className="flex justify-between items-baseline border-b border-slate-100 pb-2">
        {/* Title */}
        <h2 className="flex-1 text-xl font-bold text-slate-800 tracking-tight">
          CloudLeaf
        </h2>

        {/* Version */}
        <span className="text-sm font-mono text-slate-400 tracking-tight">
          v{version}
        </span>

        {/* Buttons to preview and open settings */}
        <div className="flex items-center gap-1">
          {/* Preview button */}
          <button
            onClick={handleOpenPreview}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
            title={messages.ui.previewCloud()}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>

          {/* Settings button */}
          <button
            onClick={openSettings}
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer group"
            title={messages.ui.openSettings()}>
            <svg
              className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        {/* Button to upload bookmarks */}
        <Button
          label={messages.ui.uploadBookmarks()}
          onClick={handleUpload}
          loading={loading}
        />

        {/* Button to download bookmarks */}
        <Button
          label={messages.ui.downloadBookmarks()}
          onClick={handleDownload}
          loading={loading}
        />

        {/* Buttons to export and import bookmarks only in chrome */}
        {!isFirefox && (
          <div className="flex gap-3">
            {/* Button to export bookmarks */}
            <Button
              label={messages.ui.exportBookmarks()}
              onClick={handleExport}
              loading={loading}
            />

            {/* Button to import bookmarks */}
            <Button
              label={messages.ui.importBookmarks()}
              onClick={handleImport}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pl-1 pt-1">
        {/* Bookmark counts */}
        <span>
          {localCount ?? "--"} / {cloudCount ?? "--"}
        </span>

        {/* GitHub link */}
        <a
          href="https://github.com/Ying-Luan/CloudLeaf"
          target="_blank"
          rel="noreferrer"
          className="p-1 hover:text-slate-600 transition-colors"
          title="GitHub">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </div>

      {/* Toaster for notifications */}
      <Toaster richColors position="top-center" />
    </div>
  )
}

export default IndexPopup
