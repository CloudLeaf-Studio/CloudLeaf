import { type BookMark } from "~types"
import { consolo } from "~utils"

/**
 * Compute SHA-256 hash of bookmark tree serialized as JSON.
 * Normalizes root nodes (menu/bar/other/mobile) by stripping titles and
 * removing empty ones before hashing to avoid cloud/local mismatches.
 *
 * @param bookmarks - Bookmark tree to hash
 *
 * @returns Hex-encoded SHA-256 digest
 */
export async function calculateBookmarkHash(
  bookmarks: BookMark[]
): Promise<string> {
  const standardRoots = ["menu", "bar", "other", "mobile"]

  consolo
    .withTag("core/bookmark/hash")
    .info("Calculating bookmark hash for tree:", bookmarks)
  const normalized = bookmarks
    // Remove root nodes with id in standardRoots that have empty children
    .filter((node) => {
      if (
        standardRoots.includes(node.id) &&
        (!node.children || node.children.length === 0)
      ) {
        return false
      }
      return true
    })
    // Strip title from all standard root nodes
    .map((node) => {
      if (standardRoots.includes(node.id)) {
        return {
          ...node,
          title: ""
        }
      }
      return node
    })
  consolo
    .withTag("core/bookmark/hash")
    .info("Normalized bookmark tree for hashing:", normalized)

  const json = JSON.stringify(normalized)
  const buffer = new TextEncoder().encode(json)
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
