import { Mutex } from "async-mutex"

import { reconcileSync } from "~core/sync"

/**
 * Debounce timer for sync scheduling.
 */
let debounceTimer: NodeJS.Timeout | null = null

/**
 * Mutex guarding sync operations.
 *
 * @readonly
 */
export const syncMutex = new Mutex()
/**
 * Flag set to `true` while applying remote data to prevent feedback loops.
 */
export const applyingCloud = { value: false }

/**
 * Schedule a debounced sync after bookmark changes.
 *
 * @param ms - Debounce window
 */
export function schedule(ms: number) {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => reconcileSync(syncMutex, applyingCloud), ms)
}

/**
 * Trigger an immediate sync check.
 */
export function trigger() {
  reconcileSync(syncMutex, applyingCloud)
}

/**
 * Create a periodic alarm for auto-sync.
 */
export function createAlarm() {
  chrome.alarms.create("sync", { periodInMinutes: 15 })
}

/**
 * Clear all scheduled tasks.
 */
export function clearAll() {
  if (debounceTimer) clearTimeout(debounceTimer)
  chrome.alarms.clear("sync")
}
