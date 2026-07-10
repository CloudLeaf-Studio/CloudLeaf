import { useState } from "react"

import { messages } from "~/src/i18n"
import {
  downloadBookmarks,
  exportBookmarks,
  importBookmarks,
  uploadBookmarks
} from "~src/core/sync"
import { type Result, type SyncPayload, type SyncStatus } from "~src/types"
import { consolo } from "~src/utils"

/**
 * Hook that provides sync actions and state for UI use.
 *
 * @returns
 * - `loading`: whether a sync operation is in progress
 * - `error`: last error message if any
 * - `performUpload(force?, localSnapshot?)`: upload local bookmarks to configured providers
 * - `performDownload()`: download bookmarks from providers
 */
export function useSync() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Perform upload of local bookmarks to cloud providers.
   *
   * @param force - When true, upload even if cloud appears newer
   * @param localSnapshot - Optional cached local payload from a previous check
   *
   * @returns
   * - sync status
   * - local snapshot payload if `force` is false
   */
  const performUpload = async (
    force = false,
    localSnapshot?: SyncPayload
  ): Promise<Result<{ status: SyncStatus; payload?: SyncPayload }>> => {
    setLoading(true)
    setError(null)
    try {
      consolo
        .withTag("hooks/useSync")
        .info(`In performUpload, starting upload when force = ${force}`)
      const res = await uploadBookmarks(force, localSnapshot)
      if (!res.ok) {
        consolo
          .withTag("hooks/useSync")
          .error(`In performUpload, upload failed: ${res.error}`)
        setError(res.error || messages.error.uploadFailed())
      }
      consolo
        .withTag("hooks/useSync")
        .info(
          `In performUpload, successfully uploaded to providers when force = ${force}`
        )
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
   * Perform download from configured providers and return payload if available.
   *
   * @returns Result object containing `status` and optional `payload` when successful
   */
  const performDownload = async (): Promise<
    Result<{ status: SyncStatus; payload?: SyncPayload }>
  > => {
    setLoading(true)
    setError(null)
    try {
      const res = await downloadBookmarks()
      if (!res.ok) {
        setError(res.error || messages.error.downloadFailed())
      }
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
   * Perform export of bookmarks to a local file.
   *
   * @returns Result object containing sync `status` on success or `error` on failure
   */
  const performExport = async (): Promise<Result<{ status: SyncStatus }>> => {
    setLoading(true)
    setError(null)
    try {
      const res = await exportBookmarks()
      if (!res.ok) {
        setError(res.error || messages.alert.exportFailed(""))
      }
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
   * Perform import of bookmarks from a local file.
   *
   * @returns Result object containing `status` and optional `payload` when importing from a local file
   */
  const performImport = async (): Promise<
    Result<{ status: SyncStatus; payload?: SyncPayload }>
  > => {
    setLoading(true)
    setError(null)
    try {
      const res = await importBookmarks()
      if (!res.ok) {
        setError(res.error || messages.alert.importFailed(""))

        consolo
          .withTag("hooks/useSync")
          .error(`In performImport, Import failed: ${res.error}`)
      }
      return res
    } catch (e) {
      const msg = String(e)
      setError(msg)
      return { ok: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    performUpload,
    performDownload,
    performExport,
    performImport
  }
}
