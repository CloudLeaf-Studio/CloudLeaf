import { create } from "zustand"
import { persist, type PersistStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

import { CONFIG_KEY, DEFAULT_USER_CONFIG } from "~constants"
import { type UserConfig, type WebDAVUserConfig } from "~types"
import { consolo } from "~utils"

import { getMaxPriority, getUserConfig, setUserConfig } from "./storage"

/**
 * Settings storage adapter for Zustand persist.
 *
 * Uses the existing config helpers to keep storage access centralized.
 *
 * @readonly
 */
const settingsStorage: PersistStorage<{ config: UserConfig }> = {
  /**
   * Read persisted settings from storage.
   *
   * @param _name - Storage key name
   *
   * @returns Persisted config state
   */
  getItem: async (_name) => {
    void _name
    return {
      state: {
        config: await getUserConfig()
      }
    }
  },

  /**
   * Write persisted settings to storage.
   *
   * @param _name - Storage key name
   * @param value - Persisted state wrapper
   */
  setItem: async (_name, value) => {
    void _name
    await setUserConfig(value.state.config)
    consolo
      .withTag("store/settings")
      .info("Persisted config to storage:", value.state.config)
  },

  /**
   * Reset persisted settings to defaults.
   *
   * @param _name - Storage key name
   */
  removeItem: async (_name) => {
    void _name
    await setUserConfig(DEFAULT_USER_CONFIG)
  }
}

/**
 * Settings store using Zustand + Immer
 *
 * Manages user configuration in memory and persists config automatically.
 */
interface SettingsState {
  // --- Data Layer ---
  /**
   * User configuration data, null when not initialized
   */
  config: UserConfig

  // --- UI Layer ---
  /**
   * Initialization in progress
   */
  initializing: boolean

  // --- Action Layer ---
  /**
   * Update configuration in memory using Immer draft (does not persist to storage)
   *
   * @param updater - updater function that receives a draft of UserConfig
   *
   * @example
   * ```ts
   * updateConfig(draft => {
   *   draft.gist.priority = 5
   *   draft.webDavConfigs[0].enabled = false
   * })
   * ```
   */
  updateConfig: (updater: (draft: UserConfig) => void) => void
  /**
   * Update WebDAV configuration in memory using Immer draft (does not persist to storage)
   *
   * @param updater - updater function that receives a draft of WebDAVUserConfig[]
   *
   * @example
   * ```ts
   * updateWebDavConfigs(draft => {
   *  draft.slice(0, 1)
   * })
   * ```
   */
  updateWebDavConfigs: (updater: (draft: WebDAVUserConfig[]) => void) => void
  /**
   * Get the next available priority value
   */
  getNextPriority: () => Promise<number>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set, get) => ({
      // --- initial state ---
      config: DEFAULT_USER_CONFIG,
      initializing: true,

      // --- Actions ---
      /**
       * Update configuration in memory using Immer draft
       *
       * @param updater - updater function that receives a draft of UserConfig
       *
       * @example
       * ```ts
       * updateConfig(draft => {
       *   draft.gist.priority = 5
       *   draft.webDavConfigs[0].enabled = false
       * })
       * ```
       */
      updateConfig: (updater: (draft: UserConfig) => void) => {
        set((state) => {
          updater(state.config)
        })
      },

      /**
       * Update WebDAV configuration in memory using Immer draft
       *
       * @param updater - updater function that receives a draft of WebDAVUserConfig
       *
       * @example
       * ```ts
       * updateWebDavConfigs(draft => {
       *  draft.enabled = false
       * })
       * ```
       */
      updateWebDavConfigs: (updater: (draft: WebDAVUserConfig[]) => void) => {
        set((state) => {
          updater(state.config.webDavConfigs!)
        })
      },

      /**
       * Get the next available priority value
       */
      getNextPriority: async () => {
        return (await getMaxPriority(get().config)) + 1
      }
    })),
    {
      name: CONFIG_KEY,
      storage: settingsStorage,
      partialize: (state) => ({
        config: state.config
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { config?: UserConfig } | undefined

        return {
          ...currentState,
          config: {
            ...DEFAULT_USER_CONFIG,
            ...persisted?.config
          }
        }
      },
      onRehydrateStorage: () => {
        // Use default initializing state until rehydration is complete
        // useSettingsStore.setState({ initializing: true })
        return () => {
          useSettingsStore.setState({ initializing: false })
        }
      }
    }
  )
)
