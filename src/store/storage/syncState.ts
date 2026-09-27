import { DEFAULT_SYNC_STATE, SYNC_STATE_KEY } from "~constants"
import type { SyncState } from "~types"

import { storage } from "./utils"

/**
 * Retrieve persisted sync state.
 *
 * @returns Sync state with defaults when not yet initialized
 */
export async function getSyncState(): Promise<SyncState> {
  const state = await storage.get<SyncState>(SYNC_STATE_KEY)
  return state ?? { ...DEFAULT_SYNC_STATE }
}

/**
 * Persist sync state.
 *
 * @param state - Sync state to store
 */
export async function setSyncState(state: SyncState): Promise<void> {
  await storage.set(SYNC_STATE_KEY, state)
}
