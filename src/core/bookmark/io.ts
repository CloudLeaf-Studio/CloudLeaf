import { getSyncState } from "~store"
import {
  type BookMark,
  type BookmarkSystemRole,
  type SyncPayload
} from "~types"
import { consolo, isFirefox, runtimeApi, type BrowserType } from "~utils"

import { calculateBookmarkHash } from "./hash"

/**
 * Browser-specific IDs for top-level system folders.
 *
 * @remarks
 * System reserved folder IDs are usually
 * - root:
 *   - "0"/"root________" (for the root folder)
 *
 * - son of root:
 *   - ???/'menu________'
 *   - '1'/'toolbar_____' (Bookmarks Bar)
 *   - '2'/'unfiled_____' (Other Bookmarks)
 *   - '3'/'mobile______' (Mobile Bookmarks)
 */
const SYSTEM_FOLDER_IDS: Record<
  BrowserType,
  Partial<Record<BookmarkSystemRole, string>>
> = {
  chrome: {
    bar: "1",
    other: "2",
    mobile: "3"
  },
  firefox: {
    menu: "menu________",
    bar: "toolbar_____",
    other: "unfiled_____",
    mobile: "mobile______"
  }
}

/**
 * Resolve a raw folder ID into a normalized system role.
 *
 * @param id - Raw bookmark folder ID from browser runtime or payload.
 *
 * @returns Normalized system role when matched, otherwise `null`.
 */
function resolveSystemRoleById(id?: string): BookmarkSystemRole | null {
  if (!id) return null
  if (id === "menu" || id === "menu________") return "menu"
  if (id === "bar" || id === "1" || id === "toolbar_____") return "bar"
  if (id === "other" || id === "2" || id === "unfiled_____") return "other"
  if (id === "mobile" || id === "3" || id === "mobile______") return "mobile"
  return null
}

/**
 * number of bookmarks processed
 */
let numBookmarks = 0

/**
 * Recursively process a chrome bookmark node into the internal `BookMark` interface.
 *
 * Updates module-level `numBookmarks` as a side effect.
 *
 * @param node - Chrome bookmark tree node
 * @param includeId - Whether to include id in the node
 *
 * @returns
 * `BookMark` when the node represents a folder or a valid bookmark,
 * otherwise `null`
 */
function processBookmarkNode(
  node: chrome.bookmarks.BookmarkTreeNode,
  includeId: boolean
): BookMark | null {
  // folder node
  if (node.children) {
    const children = node.children
      .map((child) => processBookmarkNode(child, false))
      .filter((child): child is BookMark => child !== null)
    const normalizedId = resolveSystemRoleById(node.id)
    return {
      ...(includeId && normalizedId ? { id: normalizedId } : {}),
      title: node.title,
      children: children
    }
  }

  // leaf bookmark node
  if (node.title && node.url) {
    numBookmarks++
    const normalizedId = resolveSystemRoleById(node.id)
    return {
      ...(includeId && normalizedId ? { id: normalizedId } : {}),
      title: node.title,
      url: node.url
    }
  }

  // empty folder node
  if (node.title) {
    const normalizedId = resolveSystemRoleById(node.id)
    return {
      ...(includeId && normalizedId ? { id: normalizedId } : {}),
      title: node.title
    }
  }

  // invalid node
  return null
}

/**
 * Get bookmarks from the browser and convert to `SyncPayload`.
 *
 * @returns
 * Sync payload containing `bookmarks`, `numBookmarks`,
 * `updatedAt` timestamp and `contentHash`.
 */
export async function getBookmarks(): Promise<SyncPayload> {
  try {
    consolo
      .withTag("core/bookmark/io")
      .info(`Start getting bookmarks from browser...`)
    const tree = await runtimeApi.bookmarks.getTree()
    const collects = tree[0].children
    numBookmarks = 0
    const bookmarks = collects
      .map((child) => processBookmarkNode(child, true))
      .filter((child): child is BookMark => child !== null)

    if (isFirefox) {
      const menuIndex = bookmarks.findIndex((node) => node.id === "menu")
      if (menuIndex >= 0) {
        const [menuFolder] = bookmarks.splice(menuIndex, 1)
        bookmarks.push(menuFolder)
      }
    }

    consolo
      .withTag("core/bookmark/io")
      .info(
        `Successfully got bookmarks from browser: ${numBookmarks} bookmarks`
      )
    const state = await getSyncState()
    return {
      updatedAt: state.localUpdatedAt || Date.now(),
      numBookmarks,
      bookmarks,
      contentHash: await calculateBookmarkHash(bookmarks)
    }

    // error
  } catch (error) {
    consolo.withTag("core/bookmark/io").error("Failed to get bookmarks:", error)
    return {
      updatedAt: Date.now(),
      numBookmarks: 0,
      bookmarks: [],
      contentHash: await calculateBookmarkHash([])
    }
  }
}

/**
 * Create bookmark nodes under the given parent ID.
 *
 * Recursively creates folders and bookmarks according to the `BookMark` structure.
 *
 * @param parentId - Parent bookmark folder ID
 * @param nodes - Array of `BookMark` nodes to create
 */
async function createBookmarkNodes(
  parentId: string,
  nodes: BookMark[]
): Promise<void> {
  for (const node of nodes) {
    // folder node
    if (node.children && node.children.length > 0) {
      const folder = await runtimeApi.bookmarks.create({
        parentId,
        title: node.title
      })
      await createBookmarkNodes(folder.id, node.children)
      // leaf bookmark node
    } else {
      await runtimeApi.bookmarks.create({
        parentId,
        title: node.title,
        url: node.url
      })
    }
  }
}

/**
 * Replace current browser bookmarks with the provided payload.
 *
 * Clears existing user folders (preserving system root folders) and recreates nodes from `payload.bookmarks`.
 *
 * @param payload - Sync payload containing the bookmark tree to set
 */
export async function setBookmarks(payload: SyncPayload): Promise<void> {
  const tree = await runtimeApi.bookmarks.getTree()
  const root = tree[0]

  const targetSystemFolderIds =
    SYSTEM_FOLDER_IDS[isFirefox ? "firefox" : "chrome"]
  const systemFolderIdSet = new Set(Object.values(targetSystemFolderIds))

  // --- remove all bookmarks except system folders ---
  if (root.children) {
    for (const child of root.children) {
      // if it's a system folder, only remove its children
      if (child.id && systemFolderIdSet.has(child.id)) {
        if (child.children)
          for (const grandChild of child.children)
            await runtimeApi.bookmarks.removeTree(grandChild.id).catch(() => {})
        // if it's not a system folder, remove it entirely
      } else {
        await runtimeApi.bookmarks.removeTree(child.id).catch(() => {})
      }
    }
  }

  // --- create new bookmarks from payload ---
  const roleFolderMap: Partial<Record<BookmarkSystemRole, BookMark>> = {}
  const restFolders: BookMark[] = []

  for (const node of payload.bookmarks) {
    const role = resolveSystemRoleById(node.id)
    const targetId = role ? targetSystemFolderIds[role] : undefined
    if (role && targetId) {
      roleFolderMap[role] = node
    } else {
      restFolders.push(node)
    }
  }

  // --- legacy payload fallback ---
  // Legacy payloads only contained Chrome-style top-level ordering.
  // This fallback keeps transition compatibility with old synced data.
  const hasRoleMatchedFolders = Object.keys(roleFolderMap).length > 0
  if (!hasRoleMatchedFolders) {
    restFolders.length = 0
    const [bar, other, mobile, ...rest] = payload.bookmarks
    if (bar?.children) roleFolderMap.bar = bar
    if (other?.children) roleFolderMap.other = other
    if (mobile?.children) roleFolderMap.mobile = mobile
    restFolders.push(...rest)
  }

  if (roleFolderMap.menu?.children && targetSystemFolderIds.menu)
    await createBookmarkNodes(
      targetSystemFolderIds.menu,
      roleFolderMap.menu.children
    )
  if (roleFolderMap.bar?.children && targetSystemFolderIds.bar)
    await createBookmarkNodes(
      targetSystemFolderIds.bar,
      roleFolderMap.bar.children
    )
  if (roleFolderMap.other?.children && targetSystemFolderIds.other)
    await createBookmarkNodes(
      targetSystemFolderIds.other,
      roleFolderMap.other.children
    )
  if (roleFolderMap.mobile?.children && targetSystemFolderIds.mobile)
    await createBookmarkNodes(
      targetSystemFolderIds.mobile,
      roleFolderMap.mobile.children
    )
  if (restFolders.length > 0) await createBookmarkNodes(root.id, restFolders)
}
