import { type BookMark } from "."

/**
 * Payload for sync operations between local and cloud
 */
export interface SyncPayload {
  /**
   * Timestamp of last update in milliseconds
   */
  updatedAt: number
  /**
   * Total count of bookmarks
   */
  numBookmarks: number
  /**
   * Bookmark tree data
   */
  bookmarks: BookMark[]
  /**
   * SHA-256 hash of `bookmarks`
   */
  contentHash: string
}

/**
 * Sync status between local and cloud
 *
 * - `ahead` Local content is newer than cloud
 * - `behind` Cloud content is newer than local
 * - `synced` Both sides have identical content
 * - `conflict` Content differs but timestamps are equal
 * - `none` No sync data available
 */
export type SyncStatus = "ahead" | "behind" | "synced" | "conflict" | "none"

/**
 * Synchronization lifecycle phase
 *
 * - `uninitialized` Baseline not yet established
 * - `ready` Baseline established, auto-sync can run
 * - `conflict` Manual resolution required
 */
export type SyncPhase = "uninitialized" | "ready" | "conflict"

/**
 * Last confirmed consistent sync baseline
 */
export interface SyncBaseline {
  /**
   * Primary sync target identifier
   */
  targetKey: string
  /**
   * Confirmed consistent content hash
   */
  contentHash: string
  /**
   * Confirmed consistent timestamp in milliseconds
   */
  updatedAt: number
}

/**
 * Persisted sync state for auto-sync coordination
 */
export interface SyncState {
  /**
   * Last real modification time of local bookmarks
   */
  localUpdatedAt: number
  /**
   * Current sync lifecycle phase
   */
  phase: SyncPhase
  /**
   * Last confirmed consistent baseline
   */
  baseline?: SyncBaseline
}
