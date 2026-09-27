/**
 * Local file provider module
 *
 * @packageDocumentation
 */

import { DEFAULT_FILENAME } from "~constants"
import { messages } from "~i18n"
import { BaseProvider } from "~providers"
import { type Result, type SyncPayload } from "~types"

/**
 * Local file provider
 *
 * @remarks Orchestrates native browser save/open dialogs for JSON sync payloads.
 */
export class LocalProvider extends BaseProvider {
  /**
   * Unique provider identifier
   */
  readonly id = "local_file"
  /**
   * Display name
   */
  readonly name = "Local File"

  /**
   * Generate a target key for baseline identity.
   *
   * @returns Fixed local identifier
   */
  getTargetKey(): string {
    return "local"
  }

  /**
   * Validate local provider (always valid)
   *
   * @returns Successful validation containing a valid provider result
   */
  async isValid(): Promise<Result<Result<void>>> {
    return { ok: true, data: { ok: true } }
  }

  /**
   * Trigger Browser Download to save data as a local file
   *
   * browser -\> local file
   *
   * @param data - Bookmark payload
   *
   * @returns Ok or error result
   */
  async upload(data: SyncPayload): Promise<Result<void>> {
    try {
      const json = JSON.stringify(data)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = DEFAULT_FILENAME

      // Trigger download
      document.body.appendChild(a)
      a.click()

      // Clean up
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      return { ok: true }
    } catch (error) {
      return {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : messages.error.downloadFailed()
      }
    }
  }

  /**
   * Trigger File Picker to get data from a local file
   *
   * local file -\> browser
   *
   * @returns Bookmark payload from local file
   */
  async download(): Promise<Result<SyncPayload>> {
    return new Promise((resolve) => {
      // Create file input element
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "application/json"

      // Handle file selection
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
          resolve({ ok: false, error: messages.error.noFileSelected() })
          return
        }

        try {
          const text = await file.text()
          const data = JSON.parse(text) as SyncPayload
          if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
            resolve({ ok: false, error: messages.error.invalidData() })
            return
          }
          resolve({ ok: true, data })
        } catch {
          resolve({ ok: false, error: messages.error.parseFailed() })
        }
      }

      // Handle cancelation
      input.oncancel = () => {
        resolve({ ok: false, error: messages.error.canceled() })
      }

      // click -> file -> onchange or oncancel
      input.click()
    })
  }
}
