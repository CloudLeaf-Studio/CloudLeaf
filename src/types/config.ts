/**
 * User configuration for persistence
 *
 * @remarks Stored in browser extension storage
 */
export interface UserConfig {
  /**
   * GitHub Gist configuration
   */
  gist?: GistConfig
  /**
   * WebDAV account configurations
   */
  webDavConfigs?: WebDAVUserConfig[]
  /**
   * Custom cloud vendor metadata
   */
  customVendors?: CustomVendorConfig[]
}

/**
 * GitHub Gist provider configuration
 */
export interface GistConfig {
  /**
   * Whether this provider is enabled
   */
  enabled?: boolean
  /**
   * GitHub personal access token
   */
  accessToken: string
  /**
   * Target Gist ID
   */
  gistId: string
  /**
   * Filename in the Gist
   */
  fileName?: string
  /**
   * Sync priority, lower value means higher priority
   */
  priority: number
}

/**
 * WebDAV user account configuration
 *
 * @remarks Only stores user credentials and vendor reference
 */
export interface WebDAVUserConfig {
  /**
   * Whether this provider is enabled
   */
  enabled?: boolean
  /**
   * Vendor ID referencing WebDAVRegistry
   */
  vendorId?: string
  /**
   * WebDAV username
   */
  username: string
  /**
   * WebDAV password
   */
  password: string
  /**
   * Server URL, overrides vendor default if provided
   */
  serverUrl?: string
  /**
   * File path for bookmark storage
   */
  filePath: string
  /**
   * Sync priority, lower value means higher priority
   */
  priority: number
}

/**
 * Custom cloud vendor metadata
 *
 * @remarks Loaded into WebDAVRegistry at startup, contains no user credentials
 */
export interface CustomVendorConfig {
  /**
   * Unique identifier
   */
  id: string
  /**
   * Display name
   */
  name: string
  /**
   * WebDAV server URL
   */
  serverUrl: string
}

/**
 * Default user configuration
 *
 * @readonly
 */
export const DEFAULT_USER_CONFIG: UserConfig = {
  gist: undefined,
  webDavConfigs: [],
  customVendors: []
}
