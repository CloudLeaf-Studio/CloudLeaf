/**
 * Internationalization module
 *
 * @packageDocumentation
 */

import type { SyncPhase } from "~types"

/**
 * Get localized message from Chrome i18n API
 *
 * @param key - Message key defined in _locales/[lang]/messages.json
 * @param substitutions - Optional substitution strings
 *
 * @returns Localized message string
 */
export function t(key: string, substitutions?: string | string[]): string {
  return chrome.i18n.getMessage(key, substitutions) || key
}

/**
 * Mapping from sync phase to i18n message key.
 *
 * @readonly
 */
const SYNC_PHASE_I18N_KEYS: Record<SyncPhase, string> = {
  uninitialized: "sync_phase_uninitialized",
  ready: "sync_phase_ready",
  conflict: "sync_phase_conflict"
}

/**
 * Centralized message definitions
 *
 * @remarks All user-visible strings should be defined here
 */
export const messages = {
  // === Error Messages (Result.error) ===
  error: {
    /** File not found on remote */
    fileNotFound: () => t("error_file_not_found"),
    /** Invalid JSON format */
    invalidFormat: () => t("error_invalid_format"),
    /** Cannot parse JSON */
    invalidJson: () => t("error_invalid_json"),
    /** No file selected in file picker */
    noFileSelected: () => t("error_no_file_selected"),
    /** Invalid bookmark data structure */
    invalidData: () => t("error_invalid_data"),
    /** Failed to read or parse file */
    parseFailed: () => t("error_parse_failed"),
    /** File selection canceled by user */
    canceled: () => t("error_canceled"),
    /** Request timeout */
    timeout: () => t("error_timeout"),
    /** Network error with details */
    network: (detail?: string) => t("error_network", detail || ""),
    /** Unknown network error */
    unknown: () => t("error_unknown"),
    /** Invalid access token */
    invalidToken: () => t("error_invalid_token"),
    /** Gist file not found */
    gistFileNotFound: (fileName: string) =>
      t("error_gist_file_not_found", fileName),
    /** Upload failed */
    uploadFailed: () => t("error_upload_failed"),
    /** Download failed */
    downloadFailed: () => t("error_download_failed"),
    /** All providers failed */
    allProvidersFailed: () => t("error_all_providers_failed"),
    /** No available sync source */
    noSyncSource: () => t("error_no_sync_source"),
    /** Unknown error */
    unknownError: () => t("error_unknown_error"),
    /** Sync status check failed */
    syncStatusCheck: (providerName: string) =>
      t("error_sync_status_check", providerName)
  },

  // === Alert Messages ===
  alert: {
    /** Settings saved successfully */
    settingsSaved: () => t("alert_settings_saved"),
    /** Upload successful */
    uploadSuccess: () => t("alert_upload_success"),
    /** Upload failed with error */
    uploadFailed: (error: string) => t("alert_upload_failed", error),
    /** Force upload successful */
    forceUploadSuccess: () => t("alert_force_upload_success"),
    /** Download successful */
    downloadSuccess: () => t("alert_download_success"),
    /** Download failed with error */
    downloadFailed: (error: string) => t("alert_download_failed", error),
    /** Force download successful */
    forceDownloadSuccess: () => t("alert_force_download_success"),
    /** Export successful */
    exportSuccess: () => t("alert_export_success"),
    /** Export failed with error */
    exportFailed: (error: string) => t("alert_export_failed", error),
    /** Import successful */
    importSuccess: () => t("alert_import_success"),
    /** Import failed with error */
    importFailed: (error: string) => t("alert_import_failed", error),
    /** Force import successful */
    forceImportSuccess: () => t("alert_force_import_success"),
    /** No sync provider configured */
    noProvider: () => t("alert_no_provider"),
    /** Gist connection OK */
    gistOk: () => t("alert_gist_ok"),
    /** Gist connection failed */
    gistFailed: (error: string) => t("alert_gist_failed", error),
    /** WebDAV connection OK */
    webdavOk: (username: string) => t("alert_webdav_ok", username),
    /** WebDAV connection failed */
    webdavFailed: (error: string) => t("alert_webdav_failed", error),
    /** Exception occurred */
    exception: (error: string) => t("alert_exception", error),
    /** Incomplete form info */
    incompleteInfo: () => t("alert_incomplete_info"),
    /** Vendor registered successfully */
    vendorRegistered: (name: string) => t("alert_vendor_registered", name),
    /** Vendor registration failed */
    vendorFailed: (error: string) => t("alert_vendor_failed", error),
    /** Vendor deleted successfully */
    vendorDeleted: () => t("alert_vendor_deleted"),
    /** Vendor deletion failed */
    vendorDeleteFailed: (error: string) =>
      t("alert_vendor_delete_failed", error),
    /** Sync conflict detected */
    syncConflict: () => t("alert_sync_conflict")
  },

  // === Confirm Messages ===
  confirm: {
    /** Force upload when cloud is newer */
    forceUpload: () => t("confirm_force_upload"),
    /** Force download when local is newer */
    forceDownload: () => t("confirm_force_download"),
    /** Force import when local is newer */
    forceImport: () => t("confirm_force_import"),
    /** Delete custom vendor */
    deleteVendor: () => t("confirm_delete_vendor"),
    /** Remove Gist configuration */
    removeGist: () => t("confirm_remove_gist"),
    /** Remove WebDAV account */
    removeWebdav: () => t("confirm_remove_webdav")
  },

  // === UI Text ===
  ui: {
    loading: () => t("ui_loading"),
    settingsTitle: () => t("ui_settings_title"),
    cloudPreview: () => t("ui_cloud_preview"),
    refreshData: () => t("ui_refresh_data"),
    readingCloud: () => t("ui_reading_cloud"),
    previewCloud: () => t("ui_preview_cloud"),
    openSettings: () => t("ui_open_settings"),
    uploadBookmarks: () => t("ui_upload_bookmarks"),
    downloadBookmarks: () => t("ui_download_bookmarks"),
    exportBookmarks: () => t("ui_export_bookmarks"),
    importBookmarks: () => t("ui_import_bookmarks"),
    enabledSources: () => t("ui_enabled_sources"),
    noSources: () => t("ui_no_sources"),
    addSource: () => t("ui_add_source"),
    connecting: () => t("ui_connecting"),
    verifyConnection: () => t("ui_verify_connection"),
    edit: () => t("ui_edit"),
    remove: () => t("ui_remove"),
    cancel: () => t("ui_cancel"),
    gistConfig: () => t("ui_gist_config"),
    resetConfig: () => t("ui_reset_config"),
    gistIdPlaceholder: () => t("ui_gist_id_placeholder"),
    filename: () => t("ui_filename"),
    saveGist: () => t("ui_save_gist"),
    webdavEdit: () => t("ui_webdav_edit"),
    webdavAdd: () => t("ui_webdav_add"),
    selectVendor: () => t("ui_select_vendor"),
    username: () => t("ui_username"),
    appPassword: () => t("ui_app_password"),
    filePath: () => t("ui_file_path"),
    saveChanges: () => t("ui_save_changes"),
    addWebdav: () => t("ui_add_webdav"),
    vendorManager: () => t("ui_vendor_manager"),
    vendorId: () => t("ui_vendor_id"),
    displayName: () => t("ui_display_name"),
    vendorPlaceholder: () => t("ui_vendor_placeholder"),
    serverUrl: () => t("ui_server_url"),
    saveVendor: () => t("ui_save_vendor"),
    autoSync: () => t("ui_auto_sync"),
    triggerSync: () => t("ui_trigger_sync"),
    syncing: () => t("ui_syncing"),
    syncPhase: (phase: SyncPhase) => t(SYNC_PHASE_I18N_KEYS[phase]),
    pleaseManualUploadOrDownload: () =>
      t("sync_please_manual_upload_or_download")
  }
}
