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
}

/**
 * Sync status between local and cloud
 *
 * - `ahead` Local is newer than cloud
 * - `behind` Cloud is newer than local
 * - `synced` Both sides are in sync
 * - `none` No sync data available
 */
export type SyncStatus = "ahead" | "behind" | "synced" | "none"
