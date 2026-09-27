import type { Result } from "./common"
import type { SyncPayload } from "./sync"

/**
 * Sync upload message request.
 */
export interface SyncUploadRequest {
  localSnapshot: SyncPayload
}

/**
 * Sync upload message response.
 */
export type SyncUploadResponse = Result<void>

/**
 * Sync apply message request.
 */
export interface SyncApplyRequest {
  payload: SyncPayload
}

/**
 * Sync apply message response.
 */
export type SyncApplyResponse = Result<void>

/**
 * Manual sync trigger request.
 */
export type TriggerSyncRequest = void

/**
 * Manual sync trigger response.
 */
export type TriggerSyncResponse = Result<void>
