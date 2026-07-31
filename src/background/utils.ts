import { consolo } from "~utils"

/**
 * Attach a handler to a set of bookmark events and return a cleanup function.
 *
 * Filters out `undefined` events for Firefox compatibility.
 *
 * @param events - Bookmark event objects to listen on
 * @param handler - Callback to invoke on each event
 *
 * @returns Cleanup function that removes all attached listeners
 */
export function addListeners(
  events: chrome.events.Event<() => void>[],
  handler: () => void
): () => void {
  // For compatibility with firefox
  const valid = events.filter(Boolean)
  consolo
    .withTag("background")
    .info(`adding listeners for ${valid.length}/${events.length} events`)
  valid.forEach((e) => e.addListener(handler))
  return () => valid.forEach((e) => e.removeListener(handler))
}
