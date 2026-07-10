import { getBookmarks } from "~src/core/bookmark"
import { setCount } from "~src/store"

/**
 * Memoized debounce timer for bookmark event handling.
 */
let timer: NodeJS.Timeout | null = null

/**
 * Debounced refresh of local bookmark count.
 *
 * @remarks Aggregates rapid bookmark events into a single full-tree recount.
 */
function debouncedRefresh() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(async () => {
    const payload = await getBookmarks()
    await setCount("local", payload.numBookmarks)
  }, 300)
}

chrome.bookmarks.onCreated.addListener(() => debouncedRefresh())
chrome.bookmarks.onRemoved.addListener(() => debouncedRefresh())

/**
 * Initialize local count on startup.
 */
async function init() {
  const payload = await getBookmarks()
  await setCount("local", payload.numBookmarks)
}

init()
