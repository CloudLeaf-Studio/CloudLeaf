/**
 * Logical roles of top-level system folders.
 *
 * @remarks These roles are used in sync payloads to avoid browser-specific IDs.
 */
export type BookmarkSystemRole = "menu" | "bar" | "other" | "mobile"

/**
 * Bookmark node structure
 *
 * @remarks Supports nested folder hierarchy via children property
 */
export interface BookMark {
  /**
   * Unique identifier for the bookmark, only for top-level nodes
   */
  id?: BookmarkSystemRole
  /**
   * Display title of the bookmark or folder
   */
  title: string
  /**
   * URL of the bookmark, undefined for folders
   */
  url?: string
  /**
   * Child bookmarks, present for folders
   */
  children?: BookMark[]
}

/**
 * Bookmark node with recursive subtree count for UI display.
 *
 * @remarks `bookmarkCount` is a derived value and must not be persisted.
 */
export interface CountedBookMark extends BookMark {
  /**
   * Recursive leaf count for this folder subtree
   */
  bookmarkCount?: number
  /**
   * Child nodes with their own counts
   */
  children?: CountedBookMark[]
}

/**
 * Local and cloud bookmark count cache.
 */
export interface BookmarkCountCache {
  /**
   * Local bookmark count, `null` when unknown
   */
  local: number | null
  /**
   * Cloud bookmark count, `null` when unknown
   */
  cloud: number | null
}
