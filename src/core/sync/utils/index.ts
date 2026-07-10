/**
 * Sync utilities module
 *
 * @packageDocumentation
 */

import { type SyncPayload, type SyncStatus } from "~src/types"

/**
 * Compare local and cloud payloads to determine the sync state
 *
 * @param local - Local payload containing update timestamp
 * @param cloud - Cloud payload containing update timestamp
 *
 * @returns the sync status: `'ahead'`, `'behind'`, or `'synced'`
 */
export function getSyncStatus(
  local: SyncPayload,
  cloud: SyncPayload
): SyncStatus {
  if (local.updatedAt > cloud.updatedAt) return "ahead"
  if (local.updatedAt < cloud.updatedAt) return "behind"
  return "synced"
}
