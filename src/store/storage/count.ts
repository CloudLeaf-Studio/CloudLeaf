import { COUNT_KEY } from "~constants"
import { type BookmarkCountCache } from "~types"

import { storage } from "./utils"

/**
 * Read the bookmark count cache from storage.
 *
 * @returns Count cache, defaults to `{ local: null, cloud: null }`
 */
export async function getCount(): Promise<BookmarkCountCache> {
  const cache = await storage.get<BookmarkCountCache>(COUNT_KEY)
  return cache ?? { local: null, cloud: null }
}

/**
 * Update a single count field and persist.
 *
 * @param type - `"local"` or `"cloud"`
 * @param count - Count value, or `null` to reset
 */
export async function setCount(
  type: "local" | "cloud",
  count: number | null
): Promise<void> {
  const cache = await getCount()
  cache[type] = count
  await storage.set(COUNT_KEY, cache)
}
