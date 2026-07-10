/**
 * Cloud Sync Module
 *
 * @packageDocumentation
 */

import { DEFAULT_FILENAME, HttpStatus, WebDAVStatus } from "~/src/constants"
import { getBookmarks } from "~/src/core/bookmark"
import { getSyncStatus } from "~/src/core/sync/utils"
import { messages } from "~/src/i18n"
import { BaseProvider, GistProvider, WebDAVRegistry } from "~/src/providers"
import {
  getUserConfig,
  loadCustomVendorsFromConfig,
  setCount
} from "~/src/store"
import { type Result, type SyncPayload, type SyncStatus } from "~/src/types"
import { consolo } from "~src/utils"

/**
 * Build providers from user config
 *
 * @returns
 * - providers sorted providers by priority
 * - config user config
 */
async function buildProviders() {
  const config = await getUserConfig()
  const providers: Array<{ provider: BaseProvider; priority: number }> = []

  // --- Gist Provider ---
  if (config.gist && config.gist.enabled) {
    const fileName = config.gist.fileName || DEFAULT_FILENAME
    const gist = new GistProvider(
      config.gist.accessToken,
      config.gist.gistId,
      fileName
    )
    providers.push({
      provider: gist,
      priority: config.gist.priority ?? Number.MAX_SAFE_INTEGER
    })
  }

  // --- WebDAV Providers ---
  for (const w of config.webDavConfigs || []) {
    if (w.enabled === false) continue
    try {
      loadCustomVendorsFromConfig(config)
      const provider = WebDAVRegistry.createProvider(w.vendorId, w)
      providers.push({
        provider,
        priority: w.priority ?? Number.MAX_SAFE_INTEGER
      })
    } catch {
      // skip invalid config
    }
  }

  return {
    providers: providers.sort((a, b) => a.priority - b.priority),
    config
  }
}

/**
 * Upload bookmarks: local browser -\> cloud
 *
 * @param force - whether to force upload even if cloud is newer
 * @param localSnapshot - optional cached local payload from a previous check
 *
 * @returns
 * - sync status
 * - local snapshot payload if `force` is false
 *
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 *
 * @see {@link src/hooks/useSync.ts#useSync}
 */
export async function uploadBookmarks(
  force = false,
  localSnapshot?: SyncPayload
): Promise<Result<{ status: SyncStatus; payload?: SyncPayload }>> {
  try {
    const { providers } = await buildProviders()
    // no providers configured
    if (providers.length === 0) return { ok: true, data: { status: "none" } }
    const local = localSnapshot ?? (await getBookmarks())

    // --- Check if any cloud is newer ---
    if (!force) {
      for (const item of providers) {
        consolo
          .withTag("core/sync/cloud")
          .info(
            `Start uploading to ${item.provider.name} when force = ${force}`
          )
        const res = await item.provider.download()
        if (res.ok && res.data) {
          if (getSyncStatus(local, res.data) === "behind") {
            return { ok: true, data: { status: "behind", payload: local } }
          }
        } else {
          // If file or folder not found, continue to upload
          if (
            res.status === HttpStatus.NOT_FOUND ||
            res.status === WebDAVStatus.CONFLICT
          )
            return { ok: true, data: { status: "synced" } }
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
      }
      return { ok: true, data: { status: "synced", payload: local } }
    }

    // --- Proceed to upload to all providers ---
    const errors: string[] = []
    let successCount = 0
    for (const item of providers) {
      consolo
        .withTag("core/sync/cloud")
        .info(`Start uploading to ${item.provider.name} when force = ${force}`)
      const res = await item.provider.upload(local)
      if (res.ok) {
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
      await setCount("cloud", local.numBookmarks)
      return { ok: true, data: { status: "synced" } }
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
      if (res.ok && res.data) {
        const cloud = res.data
        await setCount("cloud", cloud.numBookmarks)
        const status = getSyncStatus(local, cloud)
        return { ok: true, data: { status, payload: cloud } }
      }
      errors.push(
        `${item.provider.name}: ${res.error || messages.error.downloadFailed()}`
      )
    }

    return {
      ok: false,
      error: errors.join("\n") || messages.error.noSyncSource()
    }
  } catch (error) {
    return { ok: false, error: String(error) }
  }
}
