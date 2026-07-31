/**
 * Background service worker module.
 *
 * Registers bookmark and alarm listeners, maintains bookmark counts,
 * and coordinates automatic synchronization.
 *
 * @packageDocumentation
 */

import { getBookmarks } from "~core/bookmark"
import { getSyncState, getUserConfig, setCount, setSyncState } from "~store"
import { actionApi, consolo } from "~utils"

import { applyingCloud, createAlarm, schedule, trigger } from "./scheduler"
import { addListeners } from "./utils"

/**
 * Debounce timer for bookmark count refresh.
 */
let debounceCountTimer: NodeJS.Timeout | null = null

/**
 * Debounced refresh of local bookmark count.
 *
 * @remarks Aggregates rapid bookmark events into a single full-tree recount
 * after a 300ms quiet period.
 */
function debouncedCountRefresh() {
  if (debounceCountTimer) clearTimeout(debounceCountTimer)
  debounceCountTimer = setTimeout(async () => {
    const payload = await getBookmarks()
    await setCount("local", payload.numBookmarks)
  }, 300)
}

/**
 * Update the local modification timestamp to the current time.
 *
 * Skips the update when a cloud apply is in progress to avoid
 * contaminating the timestamp with re-created bookmarks.
 */
async function markLocalUpdated() {
  if (applyingCloud.value) return

  const state = await getSyncState()
  state.localUpdatedAt = Date.now()
  await setSyncState(state)
}

// --- Count-affecting events: schedule sync + refresh count ---
addListeners(
  [
    chrome.bookmarks.onCreated,
    chrome.bookmarks.onRemoved,
    chrome.bookmarks.onImportEnded
  ],
  () => {
    consolo
      .withTag("background")
      .info("bookmark change detected, scheduling sync and count refresh")
    markLocalUpdated()
    if (!applyingCloud.value) schedule(5000)
    debouncedCountRefresh()
  }
)

// --- Non-count events: schedule sync only ---
addListeners(
  [
    chrome.bookmarks.onChanged,
    chrome.bookmarks.onMoved,
    chrome.bookmarks.onChildrenReordered
  ],
  () => {
    consolo
      .withTag("background")
      .info("bookmark change detected, scheduling sync")
    markLocalUpdated()
    if (!applyingCloud.value) schedule(5000)
  }
)

// --- Periodic alarm triggers auto-sync ---
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "sync") {
    consolo.withTag("background").info("Alarm 'sync' triggered, starting sync")
    trigger()
  }
})

/**
 * Initialize background state on service worker startup.
 *
 * Refreshes local bookmark count, restores conflict badge,
 * and starts auto-sync if enabled.
 *
 * @returns A promise that resolves when initialization is complete
 */
async function init() {
  const payload = await getBookmarks()
  await setCount("local", payload.numBookmarks)

  const state = await getSyncState()
  if (state.phase === "conflict") {
    actionApi.setBadgeText({ text: "!" })
    actionApi.setBadgeBackgroundColor({ color: "#DC2626" })
  }

  const config = await getUserConfig()
  if (config.sync?.autoSyncEnabled && state.phase === "ready") {
    schedule(5000)
    createAlarm()
  }
}

init()
