import { type BookMark } from "~types"

/**
 * Compute SHA-256 hash of bookmark tree serialized as JSON.
 *
 * @param bookmarks - Bookmark tree to hash
 *
 * @returns Hex-encoded SHA-256 digest
 */
export async function calculateBookmarkHash(
  bookmarks: BookMark[]
): Promise<string> {
  const json = JSON.stringify(bookmarks)
  const buffer = new TextEncoder().encode(json)
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
