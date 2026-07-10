import { t } from "~/src/i18n"
import { type CustomVendorConfig, type WebDAVUserConfig } from "~/src/types"

import { WebDAVProvider } from "./webdav"

/**
 * WebDAV vendor registry (static singleton)
 *
 * @remarks Manages preset and custom vendors, provides factory method
 */
export class WebDAVRegistry {
  // Preset vendors (read-only)
  private static readonly presetVendors: CustomVendorConfig[] = [
    {
      id: "jianguoyun",
      name: "坚果云",
      serverUrl: "https://dav.jianguoyun.com/dav"
    }
  ]

  // Custom vendors (dynamic)
  private static customVendors: CustomVendorConfig[] = []

  // Prevent instantiation
  private constructor() {}

  /**
   * Get all vendors (preset + custom)
   * @returns Combined vendor list
   */
  public static getAllVendors(): CustomVendorConfig[] {
    // Apply i18n to preset vendor names
    const localizedPresets = this.presetVendors.map((v) => ({
      ...v,
      name: v.id === "jianguoyun" ? t("vendor_jianguoyun") : v.name
    }))
    return [...localizedPresets, ...this.customVendors]
  }

  /**
   * Get vendor by ID
   *
   * @param id - Vendor ID
   *
   * @returns Vendor config or undefined
   */
  public static getVendor(id: string): CustomVendorConfig | undefined {
    return this.getAllVendors().find((v) => v.id === id)
  }

  /**
   * Add custom vendor
   *
   * @param vendor - Vendor config to add
   *
   * @remarks Use `addCustomVendorToConfig` from store/loader.ts instead
   *
   * @see {@link src/store/loader.ts#addCustomVendorToConfig}
   */
  public static addCustomVendor(vendor: CustomVendorConfig): void {
    // --- Check if ID exists ---
    if (this.getVendor(vendor.id)) {
      throw new Error(`Vendor ID "${vendor.id}" already exists`)
    }
    this.customVendors.push(vendor)
  }

  /**
   * Remove custom vendor
   *
   * @param id - Vendor ID to remove
   *
   * @returns Whether removal was successful
   *
   * @remarks Use `removeCustomVendorFromConfig` from store/loader.ts instead
   *
   * @see {@link src/store/loader.ts#removeCustomVendorFromConfig}
   */
  public static removeCustomVendor(id: string): boolean {
    const index = this.customVendors.findIndex((v) => v.id === id)
    if (index === -1) {
      return false
    }
    this.customVendors.splice(index, 1)
    return true
  }

  /**
   * Clear all custom vendors
   */
  public static clearCustomVendors(): void {
    this.customVendors = []
  }

  /**
   * Get all custom vendors
   *
   * @returns Custom vendors array copy
   */
  public static getCustomVendors(): CustomVendorConfig[] {
    return [...this.customVendors]
  }

  /**
   * Get all preset vendors
   *
   * @returns Preset vendors array copy
   */
  public static getPresetVendors(): CustomVendorConfig[] {
    return this.presetVendors.map((v) => ({
      ...v,
      name: v.id === "jianguoyun" ? t("vendor_jianguoyun") : v.name
    }))
  }

  /**
   * Create WebDAV provider instance
   *
   * @param vendorId - Vendor ID to use
   * @param config - User configuration
   *
   * @returns Configured WebDAVProvider instance
   */
  public static createProvider(
    vendorId: string,
    config: WebDAVUserConfig
  ): WebDAVProvider {
    const vendor = this.getVendor(vendorId)

    if (!vendor) {
      throw new Error(`Unknown WebDAV vendor: ${vendorId}`)
    }

    const serverUrl = config.serverUrl || vendor.serverUrl
    if (!serverUrl) {
      throw new Error(`Vendor ${vendor.name} requires serverUrl`)
    }

    const filePath = config.filePath

    return new WebDAVProvider(
      vendor.id,
      vendor.name,
      serverUrl,
      config.username,
      config.password,
      filePath
    )
  }
}
