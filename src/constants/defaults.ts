import type { SyncState, UserConfig } from "~types"

/**
 * Default filename for sync bookmark data
 *
 * @readonly
 */
export const DEFAULT_FILENAME = "CloudLeaf.json"

/**
 * Default file path for WebDAV storage
 *
 * @readonly
 */
export const DEFAULT_WEBDAV_FILEPATH = "/CloudLeaf/CloudLeaf.json"

/**
 * Default sync state.
 *
 * @readonly
 */
export const DEFAULT_SYNC_STATE: SyncState = {
  localUpdatedAt: 0,
  phase: "uninitialized"
}

/**
 * Default user configuration.
 *
 * @readonly
 */
export const DEFAULT_USER_CONFIG: UserConfig = {
  gist: undefined,
  webDavConfigs: [],
  customVendors: [],
  sync: {
    autoSyncEnabled: false
  }
}
