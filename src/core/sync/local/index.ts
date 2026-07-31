/**
 * Local Sync Module
 *
 * @packageDocumentation
 */

import { getBookmarks } from "~core/bookmark"
import { getSyncStatus } from "~core/sync/utils"
import { messages } from "~i18n"
import { LocalProvider } from "~providers"
import { type Result, type SyncPayload, type SyncStatus } from "~types"
import { consolo } from "~utils"

const provider = new LocalProvider()

/**
 * Export browser bookmarks to a local JSON file
 *
 * @returns sync status
 *
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 *
 * @see {@link src/hooks/useSync.ts#useSync}
 */
export async function exportBookmarks(): Promise<
  Result<{ status: SyncStatus }>
> {
  try {
    const data = await getBookmarks()
    const res = await provider.upload(data)

    if (res.ok === false)
      return { ok: false, error: res.error || messages.alert.exportFailed("") }

    return { ok: true, data: { status: "synced" } }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : messages.alert.exportFailed("")
    }
  }
}

/**
 * Import bookmarks from a local JSON file
 *
 * @returns sync status and payload
 *
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 *
 * @see {@link src/hooks/useSync.ts#useSync}
 */
export async function importBookmarks(): Promise<
  Result<{ status: SyncStatus; payload?: SyncPayload }>
> {
  try {
    const res = await provider.download()
    consolo
      .withTag("core/sync/local")
      .info("Successfully downloaded file from localProvider")
    if (res.ok === false) {
      return {
        ok: false,
        error: res.error || messages.alert.importFailed("")
      }
    }
    if (!res.data) {
      return { ok: false, error: messages.alert.importFailed("") }
    }

    const file = res.data
    const browser = await getBookmarks()
    const status = await getSyncStatus(browser, file)
    return { ok: true, data: { status, payload: file } }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : messages.alert.importFailed("")
    }
  }
}
