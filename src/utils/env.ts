/**
 * Supported browser runtime families.
 */
export type BrowserType = "chrome" | "firefox"

/**
 * Whether the current build target is Firefox.
 *
 * @readonly
 */
export const isFirefox = process.env.PLASMO_BROWSER === "firefox"

/**
 * Runtime bookmarks API.
 *
 * @readonly
 */
export const runtimeApi = isFirefox ? browser : chrome

/**
 * Runtime action (badge) API.
 *
 * @readonly
 */
export const actionApi = isFirefox ? browser.browserAction : chrome.action
