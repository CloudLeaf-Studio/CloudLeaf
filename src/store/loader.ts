import { WebDAVRegistry } from "~providers"
import { type CustomVendorConfig, type UserConfig } from "~types"

// TODO: consider changing config type from UserConfig to CustomVendorConfig[] for a clearer frontend surface; needs further analysis
/**
 * Load custom vendors from UserConfig into WebDAVRegistry
 *
 * @param config - User configuration
 *
 * @remarks Should be called at app startup
 */
export function loadCustomVendorsFromConfig(config: UserConfig): void {
  if (!config.customVendors || config.customVendors.length === 0) {
    return
  }

  // --- Clear existing to prevent duplicates ---
  WebDAVRegistry.clearCustomVendors()

  for (const vendor of config.customVendors) {
    try {
      WebDAVRegistry.addCustomVendor({
        id: vendor.id,
        name: vendor.name,
        serverUrl: vendor.serverUrl
      })
    } catch (error) {
      console.warn(`Failed to load vendor ${vendor.id}:`, error)
    }
  }
}

/**
 * Add custom vendor and sync to UserConfig
 *
 * @param currentConfig - Current user config
 * @param vendor - Vendor metadata to add
 *
 * @returns Updated customVendors array
 *
 * @remarks Also registers to WebDAVRegistry
 */
export function addCustomVendorToConfig(
  currentConfig: UserConfig,
  vendor: CustomVendorConfig
): CustomVendorConfig[] {
  // --- Register to WebDAVRegistry ---
  WebDAVRegistry.addCustomVendor({
    id: vendor.id,
    name: vendor.name,
    serverUrl: vendor.serverUrl
  })

  // --- Update config ---
  const customVendors = currentConfig.customVendors || []
  return [...customVendors, vendor]
}

/**
 * Remove custom vendor and sync to UserConfig
 *
 * @param currentConfig - Current user config
 * @param vendorId - Vendor ID to remove
 *
 * @returns Updated customVendors array
 *
 * @remarks Also removes from WebDAVRegistry
 */
export function removeCustomVendorFromConfig(
  currentConfig: UserConfig,
  vendorId: string
): CustomVendorConfig[] {
  // --- Remove from WebDAVRegistry ---
  WebDAVRegistry.removeCustomVendor(vendorId)

  // --- Update config ---
  const customVendors = currentConfig.customVendors || []
  return customVendors.filter((v) => v.id !== vendorId)
}
