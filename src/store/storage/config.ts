import { CONFIG_KEY, DEFAULT_USER_CONFIG } from "~constants"
import type { UserConfig } from "~types"

import { storage } from "./utils"

/**
 * Retrieve user configuration from storage
 *
 * @returns User config with defaults applied
 */
export async function getUserConfig(): Promise<UserConfig> {
  const config = await storage.get<UserConfig>(CONFIG_KEY)

  if (!config) {
    return { ...DEFAULT_USER_CONFIG }
  }

  // --- Merge with defaults ---
  return {
    gist: config.gist,
    webDavConfigs: config.webDavConfigs || [],
    customVendors: config.customVendors || [],
    sync: config.sync
  }
}

/* eslint-disable tsdoc/syntax */

/**
 * Get the highest priority number across all sources
 *
 * @returns Maximum priority value (higher = lower priority)
 *
 * @remarks
 * Used when adding new sources
 *
 * Not intended for direct use. For frontend integration, please refer to the function below
 *
 * @see {@link src/store/settings.ts#useSettingsStore(state => state.getNextPriority)}
 */
export async function getMaxPriority(): Promise<number> {
  const config = await getUserConfig()
  const priorities = [
    config.gist?.priority,
    ...config.webDavConfigs.map((acc) => acc.priority)
  ]

  return Math.max(0, ...priorities)
}

/**
 * Replace entire user configuration
 *
 * @param config - Complete config to save
 *
 * @remarks Not intended for direct use. For frontend integration, please refer to the function below
 *
 * @see {@link src/store/settings.ts#useSettingsStore(state => state.persistConfig)}
 */
export async function setUserConfig(config: UserConfig): Promise<void> {
  await storage.set(CONFIG_KEY, config)
}

/* eslint-enable tsdoc/syntax */
