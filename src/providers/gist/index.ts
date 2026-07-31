/**
 * GitHub Gist provider module
 *
 * @packageDocumentation
 */

import { GIST_ENDPOINTS, HttpStatus } from "~constants"
import { messages } from "~i18n"
import { HttpProvider } from "~providers"
import { type Result, type SyncPayload } from "~types"
import { consolo } from "~utils"

/**
 * GitHub Gist storage provider
 *
 * @remarks Stores bookmarks as a file in a GitHub Gist
 */
export class GistProvider extends HttpProvider {
  /**
   * Unique provider identifier
   */
  readonly id = "gist"
  /**
   * Provider display name
   */
  readonly name = "GitHub Gist"

  /**
   * GitHub API base URL
   */
  protected readonly baseUrl = GIST_ENDPOINTS.BASE_URL

  /**
   * GitHub personal access token
   */
  private accessToken: string
  /**
   * Target Gist ID
   */
  private gistId: string
  /**
   * Filename in the Gist
   */
  private fileName: string

  /**
   * Create a new GistProvider instance
   *
   * @param accessToken - GitHub personal access token
   * @param gistId - Target Gist ID
   * @param fileName - Filename to store bookmarks
   */
  constructor(accessToken: string, gistId: string, fileName: string) {
    super()
    this.accessToken = accessToken
    this.gistId = gistId
    this.fileName = fileName
  }

  /**
   * Generate a target key for baseline identity.
   *
   * @returns Non-sensitive provider + Gist ID + filename identifier
   */
  getTargetKey(): string {
    return `gist:${this.gistId}:${this.fileName}`
  }

  /**
   * Get base headers for GitHub API
   *
   * @returns Headers with GitHub API version
   */
  protected getBaseHeaders(): Record<string, string> {
    return {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  }

  /**
   * Get authentication headers
   *
   * @returns Empty object (auth passed per-request)
   */
  protected getAuthHeaders(): Record<string, string> {
    return {}
  }

  /**
   * Validate Gist configuration and access token
   *
   * @returns Validation operation result containing the provider validity result
   */
  async isValid(): Promise<Result<Result<void>>> {
    try {
      // --- Validate Gist exists ---
      const gistResponse = await this.request(
        "GET",
        `${GIST_ENDPOINTS.GIST_PATH}/${this.gistId}`
      )

      if (!gistResponse.ok) {
        return {
          ok: true,
          data: {
            ok: false,
            error: this.handleError(gistResponse).error
          }
        }
      }

      // --- Validate access token ---
      const userResponse = await this.request("GET", GIST_ENDPOINTS.USER_PATH, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      })
      if (!userResponse.ok) {
        return {
          ok: true,
          data: {
            ok: false,
            error: messages.error.invalidToken()
          }
        }
      }

      const gistData = await gistResponse.json()
      if (!gistData.files[this.fileName]) {
        return { ok: true, data: { ok: true } }
      }

      return { ok: true, data: { ok: true } }
    } catch (error) {
      return this.handleNetworkError(error)
    }
  }

  /**
   * Upload bookmarks to Gist
   *
   * @param data - Bookmark payload
   *
   * @returns Ok or error result
   */
  async upload(data: SyncPayload): Promise<Result<void>> {
    try {
      const response = await this.request(
        "PATCH",
        `${GIST_ENDPOINTS.GIST_PATH}/${this.gistId}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          },
          body: {
            files: {
              [this.fileName]: {
                content: JSON.stringify(data)
              }
            }
          }
        }
      )

      if (!response.ok) {
        consolo.withTag("providers/gist").error("Gist upload failed")
        return this.handleError(response)
      }

      return { ok: true }
    } catch (error) {
      return this.handleNetworkError(error)
    }
  }

  /**
   * Download bookmarks from Gist
   *
   * @returns Bookmark payload
   */
  async download(): Promise<Result<SyncPayload>> {
    try {
      const response = await this.request(
        "GET",
        `${GIST_ENDPOINTS.GIST_PATH}/${this.gistId}`
      )

      if (!response.ok) {
        return this.handleError(response)
      }

      const gistData = await response.json()
      const file = gistData.files[this.fileName]

      if (!file) {
        return {
          ok: false,
          status: HttpStatus.NOT_FOUND,
          error: messages.error.gistFileNotFound(this.fileName)
        }
      }

      const payload = JSON.parse(file.content) as SyncPayload
      if (!payload.bookmarks || !Array.isArray(payload.bookmarks)) {
        return { ok: false, error: messages.error.invalidFormat() }
      }
      return { ok: true, data: payload }
    } catch (error) {
      return this.handleNetworkError(error)
    }
  }
}
