/**
 * Cloud Sync Module
 *
 * @packageDocumentation
 */

import { HttpStatus, WebDAVStatus } from "~constants"
import { getBookmarks } from "~core/bookmark"
import { buildProviders, getSyncStatus } from "~core/sync/utils"
import { messages } from "~i18n"
import { setCount } from "~store"
import { type Result, type SyncPayload, type SyncStatus } from "~types"
import { consolo } from "~utils"

/**
 * Check cloud status before uploading.
 *
 * Downloads from each provider and compares with current local bookmarks
 * to determine whether an upload can proceed or requires user confirmation.
 *
 * @returns
 * - sync status
 * - local payload snapshot for the subsequent upload
 *
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 *
 * @see {@link src/hooks/useSync.ts#useSync}
 */
export async function checkUploadStatus(): Promise<
  Result<{ status: SyncStatus; payload: SyncPayload }>
> {
  try {
    const { providers } = await buildProviders()
    const local = await getBookmarks()
    // no providers configured
    if (providers.length === 0)
      return { ok: true, data: { status: "none", payload: local } }

    // --- Check if any cloud is newer ---
    for (const item of providers) {
      consolo
        .withTag("core/sync/cloud")
        .info(`Checking upload status for ${item.provider.name}`)
      const res = await item.provider.download()
      if (res.ok === false) {
        // If file or folder not found, allowed to upload
        if (
          res.status === HttpStatus.NOT_FOUND ||
          res.status === WebDAVStatus.CONFLICT
        )
          return { ok: true, data: { status: "synced", payload: local } }
        consolo
          .withTag("core/sync/cloud")
          .error(
            `Download from ${item.provider.name} failed during upload check`
          )
        return {
          ok: false,
          error: `${messages.error.syncStatusCheck(item.provider.name)}: ${res.error || messages.error.downloadFailed()}`
        }
      }
      if (!res.data) {
        return { ok: false, error: messages.error.invalidData() }
      }

      const status = await getSyncStatus(local, res.data)
      if (status === "behind") {
        return { ok: true, data: { status: "behind", payload: local } }
      }
      if (status === "conflict") {
        return { ok: true, data: { status: "conflict", payload: local } }
      }
    }
    return { ok: true, data: { status: "synced", payload: local } }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}

/**
 * Upload bookmarks: local browser -\> cloud
 *
 * @param localSnapshot - Local payload snapshot from a previous check
 *
 * @returns Ok or error result
 *
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 *
 * @see {@link src/hooks/useSync.ts#useSync}
 */
export async function uploadBookmarks(
  localSnapshot: SyncPayload
): Promise<Result<void>> {
  try {
    const { providers } = await buildProviders()
    // no providers configured
    if (providers.length === 0)
      return { ok: false, error: messages.error.noSyncSource() }
    // --- Proceed to upload to all providers ---
    const errors: string[] = []
    let successCount = 0
    for (const item of providers) {
      consolo
        .withTag("core/sync/cloud")
        .info(`Start uploading to ${item.provider.name}`)
      const res = await item.provider.upload(localSnapshot)
      if (res.ok === true) {
        successCount++
      } else {
        consolo
          .withTag("core/sync/cloud")
          .error(`Upload to ${item.provider.name} failed`)
        errors.push(
          `${item.provider.name}: ${res.error || messages.error.uploadFailed()}`
        )
      }
    }

    // success!
    if (successCount > 0) {
      await setCount("cloud", localSnapshot.numBookmarks)
      return { ok: true }
    }

    // fail or error
    return {
      ok: false,
      error: errors.join("\n") || messages.error.allProvidersFailed()
    }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}

/**
 * Download bookmarks: cloud -\> local browser
 *
 * @returns
 * - sync status
 * - sync payload if applicable
 *
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 *
 * @see {@link src/hooks/useSync.ts#useSync}
 */
export async function downloadBookmarks(): Promise<
  Result<{ status: SyncStatus; payload?: SyncPayload }>
> {
  try {
    const { providers } = await buildProviders()
    // no providers configured
    if (providers.length === 0) return { ok: true, data: { status: "none" } }
    const local = await getBookmarks()
    const errors: string[] = []

    for (const item of providers) {
      consolo
        .withTag("core/sync/cloud")
        .info(`Start downloading from ${item.provider.name}...`)
      const res = await item.provider.download()
      if (res.ok === false) {
        errors.push(
          `${item.provider.name}: ${res.error || messages.error.downloadFailed()}`
        )
        continue
      }
      if (!res.data) {
        errors.push(`${item.provider.name}: ${messages.error.invalidData()}`)
        continue
      }

      const cloud = res.data
      await setCount("cloud", cloud.numBookmarks)
      const status = await getSyncStatus(local, cloud)
      return { ok: true, data: { status, payload: cloud } }
    }

    return {
      ok: false,
      error: errors.join("\n") || messages.error.noSyncSource()
    }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}
