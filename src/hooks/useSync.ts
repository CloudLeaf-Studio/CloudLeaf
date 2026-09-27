import { useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import {
  checkUploadStatus,
  downloadBookmarks,
  exportBookmarks,
  importBookmarks
} from "~core/sync"
import { messages } from "~i18n"
import {
  type Result,
  type SyncApplyRequest,
  type SyncApplyResponse,
  type SyncPayload,
  type SyncStatus,
  type SyncUploadRequest,
  type SyncUploadResponse
} from "~types"
import { consolo } from "~utils"

/**
 * Hook that provides sync actions and state for UI use.
 *
 * @returns
 * - `loading`: whether a sync operation is in progress
 * - `error`: last error message if any
 * - `performUploadCheck()`: check cloud status before uploading
 * - `performUpload(localSnapshot)`: upload bookmarks to configured providers
 * - `performDownload()`: download bookmarks from providers
 * - `performExport()`: export bookmarks to a local file
 * - `performImport()`: import bookmarks from a local file
 * - `performApply(payload)`: apply a payload to local bookmarks
 */
export function useSync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Generic async executor with loading/error state management.
   *
   * @typeParam T - Result data type
   *
   * @param operation - Async function returning a `Result`
   * @param fallbackError - Default error message when result has no error
   *
   * @returns The `Result` from the operation, or a synthetic failure on throw
   */
  const runOperation = async <T>(
    operation: () => Promise<Result<T>>,
    fallbackError: string
  ): Promise<Result<T>> => {
    setLoading(true)
    setError(null)
    try {
      const res = await operation()
      if (res.ok === false) setError(res.error || fallbackError)
      return res
    } catch (e) {
      const msg = String(e)
      setError(msg)
      return { ok: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Check cloud status before uploading.
   *
   * Downloads from providers and compares with local bookmarks.
   *
   * @returns Upload preflight result with sync status and local payload
   */
  const performUploadCheck = async (): Promise<
    Result<{ status: SyncStatus; payload: SyncPayload }>
  > => runOperation(checkUploadStatus, messages.error.uploadFailed())

  /**
   * Upload local bookmarks to cloud providers via background service worker.
   *
   * @param localSnapshot - Local payload snapshot from a previous check
   *
   * @returns Ok or error result
   */
  const performUpload = async (
    localSnapshot: SyncPayload
  ): Promise<Result<void>> => {
    consolo.withTag("hooks/useSync").info("Starting upload to providers")
    const res = await runOperation(
      () =>
        sendToBackground<SyncUploadRequest, SyncUploadResponse>({
          name: "syncUpload",
          body: { localSnapshot }
        }),
      messages.error.uploadFailed()
    )
    if (res.ok) {
      consolo
        .withTag("hooks/useSync")
        .info("Successfully uploaded to providers")
    }
    return res
  }

  /**
   * Download from configured providers and return payload if available.
   *
   * @returns Result object containing `status` and optional `payload` when successful
   */
  const performDownload = async (): Promise<
    Result<{ status: SyncStatus; payload?: SyncPayload }>
  > => runOperation(downloadBookmarks, messages.error.downloadFailed())

  /**
   * Export of bookmarks to a local file.
   *
   * @returns Result object containing sync `status` on success or `error` on failure
   */
  const performExport = async (): Promise<Result<{ status: SyncStatus }>> =>
    runOperation(exportBookmarks, messages.alert.exportFailed(""))

  /**
   * Import of bookmarks from a local file.
   *
   * @returns Result object containing `status` and optional `payload` when importing from a local file
   */
  const performImport = async (): Promise<
    Result<{ status: SyncStatus; payload?: SyncPayload }>
  > => {
    const res = await runOperation(
      importBookmarks,
      messages.alert.importFailed("")
    )
    if (res.ok === false) {
      consolo.withTag("hooks/useSync").error(`Import failed: ${res.error}`)
    }
    return res
  }

  /**
   * Apply a sync payload to local bookmarks via background service worker.
   *
   * @param payload - Sync payload to apply
   *
   * @returns Ok or error result
   */
  const performApply = async (payload: SyncPayload): Promise<Result<void>> =>
    runOperation(
      () =>
        sendToBackground<SyncApplyRequest, SyncApplyResponse>({
          name: "syncApply",
          body: { payload }
        }),
      messages.error.downloadFailed()
    )

  return {
    loading,
    error,
    performUploadCheck,
    performUpload,
    performDownload,
    performExport,
    performImport,
    performApply
  }
}
