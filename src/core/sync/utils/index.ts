/**
 * Sync utilities module
 *
 * @packageDocumentation
 */

import { DEFAULT_FILENAME } from "~constants"
import { calculateBookmarkHash } from "~core/bookmark"
import { BaseProvider, GistProvider, WebDAVRegistry } from "~providers"
import { getUserConfig, loadCustomVendorsFromConfig } from "~store"
import { type SyncPayload, type SyncStatus } from "~types"

/**
 * Compare local and cloud payloads using hash-first logic.
 *
 * @param local - Local payload
 * @param cloud - Cloud payload
 *
 * @returns the sync status: `'ahead'`, `'behind'`, `'synced'` or `'conflict'`
 */
export async function getSyncStatus(
  local: SyncPayload,
  cloud: SyncPayload
): Promise<SyncStatus> {
  const localHash =
    local.contentHash ?? (await calculateBookmarkHash(local.bookmarks))
  const cloudHash =
    cloud.contentHash ?? (await calculateBookmarkHash(cloud.bookmarks))

  if (localHash === cloudHash) return "synced"
  if (local.updatedAt > cloud.updatedAt) return "ahead"
  if (local.updatedAt < cloud.updatedAt) return "behind"
  return "conflict"
}

/**
 * Build providers from user config sorted by priority.
 *
 * @param firstOnly - When `true`, return only the highest-priority provider
 *
 * @returns
 * - providers sorted providers by priority (or just the top one)
 * - config user config
 */
export async function buildProviders(firstOnly = false) {
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

  const sorted = providers.sort((a, b) => a.priority - b.priority)
  return {
    providers: firstOnly ? sorted.slice(0, 1) : sorted,
    config
  }
}
