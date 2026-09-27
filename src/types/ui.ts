/**
 * UI representation of a sync source for settings display
 *
 * @remarks
 * Used in Sources component to render and manage sync providers.
 *
 * Combines both Gist and WebDAV configs into a unified list for priority ordering.
 */
export interface SourceItem {
  /**
   * Provider type discriminator
   */
  type: "gist" | "webdav"
  /**
   * Unique identifier for React rendering, e.g. "gist" or "webdav-0"
   */
  id: string
  /**
   * Display label shown in UI, e.g. "jianguoyun / user\@example.com /path"
   */
  label: string
  /**
   * Sync priority for ordering, lower value means higher priority
   */
  priority: number
  /**
   * Original index in webDavConfigs array, used for locating the config when updating
   */
  rawIndex?: number
  /**
   * Whether this sync source is enabled
   */
  enabled: boolean
}

/**
 * Editor state for opening the inline editor panel
 */
export interface Editor {
  /**
   * Edit mode
   */
  mode: "add" | "edit"
  /**
   * Provider type to edit
   */
  type: "gist" | "webdav"
  /**
   * Index of the item to edit (for edit mode and webdav only)
   */
  index?: number
}
