import { CONFIG_KEY, DEFAULT_USER_CONFIG } from "~constants"
import type { LegacyUserConfig, UserConfig } from "~types"

import { storage } from "./utils"

/**
 * Retrieve user configuration from storage
 *
 * @param config - Optional legacy user config. When omitted, read from storage.
 *
 * @returns User config with defaults applied
 */
function normalizeUserConfig(config?: LegacyUserConfig | null): UserConfig {
  return {
    gistConfigs:
      config?.gistConfigs ??
      (config?.gist ? [config.gist] : DEFAULT_USER_CONFIG.gistConfigs),
    webDavConfigs: config?.webDavConfigs ?? DEFAULT_USER_CONFIG.webDavConfigs,
    customVendors: config?.customVendors ?? DEFAULT_USER_CONFIG.customVendors,
    sync: config?.sync ?? DEFAULT_USER_CONFIG.sync
  }
}

/**
 * Retrieve user configuration from storage and migrate legacy Gist settings.
 *
 * @returns User config with defaults applied and legacy fields migrated
 */
export async function getUserConfig(): Promise<UserConfig> {
  const config = await storage.get<LegacyUserConfig>(CONFIG_KEY)

  if (!config) {
    return normalizeUserConfig()
  }

  const normalized = normalizeUserConfig(config)
  if ("gist" in config) {
    await storage.set(CONFIG_KEY, normalized)
  }
  return normalized
}

/* eslint-disable tsdoc/syntax */

/**
 * Get the highest priority number across all sources
 *
 * @param config - Optional user config. When omitted, read from storage.
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
export async function getMaxPriority(config?: UserConfig): Promise<number> {
  const current = config ?? (await getUserConfig())
  const priorities = [
    ...current.gistConfigs.map((gist) => gist.priority),
    ...current.webDavConfigs.map((acc) => acc.priority)
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
