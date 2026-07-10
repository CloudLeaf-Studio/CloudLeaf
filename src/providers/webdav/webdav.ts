import {
  getWebDAVStatusMessage,
  HttpStatus,
  WebDAVStatus
} from "~/src/constants"
import { messages } from "~/src/i18n"
import { HttpProvider } from "~/src/providers"
import { type Result, type SyncPayload } from "~/src/types"
import { consolo } from "~src/utils"

/**
 * WebDAV protocol storage provider
 *
 * @remarks Extends HttpProvider with WebDAV-specific functionality
 */
export class WebDAVProvider extends HttpProvider {
  // Provider unique identifier
  readonly id: string
  // Provider display name
  readonly name: string

  // WebDAV server URL
  protected serverUrl: string
  // WebDAV username
  protected username: string
  // WebDAV password
  protected password: string
  // File path for bookmark storage
  protected filePath: string

  /**
   * Create a new WebDAVProvider instance
   *
   * @param id - Provider unique identifier
   * @param name - Provider display name
   * @param serverUrl - WebDAV server URL
   * @param username - WebDAV username
   * @param password - WebDAV password
   * @param filePath - File path for bookmark storage
   */
  constructor(
    id: string,
    name: string,
    serverUrl: string,
    username: string,
    password: string,
    filePath: string
  ) {
    super()
    this.id = id
    this.name = name
    this.serverUrl = this.normalizeUrl(serverUrl)
    this.username = username
    this.password = password
    this.filePath = this.normalizePath(filePath)
  }

  protected get baseUrl(): string {
    return this.serverUrl
  }

  /**
   * Validate WebDAV configuration and connection
   *
   * @returns Whether configuration is valid
   */
  async isValid(): Promise<Result<boolean>> {
    try {
      const response = await this.request("PROPFIND", this.filePath, {
        headers: { Depth: "0" }
      })

      const { status } = response

      // --- File exists ---
      if (status === WebDAVStatus.MULTI_STATUS) {
        return { ok: true, data: true, status }
      }

      // --- File not found or conflict is OK ---
      if (status === HttpStatus.NOT_FOUND || status === WebDAVStatus.CONFLICT) {
        return { ok: true, data: true, status }
      }

      // --- Auth failure ---
      if (status === HttpStatus.UNAUTHORIZED) {
        return {
          ok: true,
          data: false,
          status,
          error: this.getErrorMessage(status)
        }
      }

      return {
        ok: true,
        data: false,
        status,
        error: this.getErrorMessage(status)
      }
    } catch (error) {
      return this.handleNetworkError(error)
    }
  }

  /**
   * Upload bookmarks to WebDAV server
   *
   * @param data - Bookmark payload
   *
   * @returns Ok or error result
   */
  async upload(data: SyncPayload): Promise<Result<void>> {
    try {
      // --- Ensure parent directory exists ---
      await this.ensureDirectory()

      consolo
        .withTag("providers/webdav")
        .info(`Start uploading to ${this.name}...`)
      const response = await this.request("PUT", this.filePath, {
        body: data,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      })

      if (this.isSuccess(response.status)) {
        consolo
          .withTag("providers/webdav")
          .info(`Successfully uploaded to ${this.name}`)
        return { ok: true, status: response.status }
      }

      return this.handleWebDAVError(response.status)
    } catch (error) {
      return this.handleNetworkError(error)
    }
  }

  /**
   * Download bookmarks from WebDAV server
   *
   * @returns Bookmark payload
   */
  async download(): Promise<Result<SyncPayload>> {
    try {
      consolo
        .withTag("providers/webdav")
        .info(`Start downloading from ${this.name}...`)
      const response = await this.request("GET", this.filePath)

      const { status } = response

      if (status === HttpStatus.NOT_FOUND) {
        return { ok: false, status, error: messages.error.fileNotFound() }
      }

      if (!this.isSuccess(status)) {
        return this.handleWebDAVError(status)
      }

      const content = await response.text()

      // --- Parse JSON ---
      try {
        const data = JSON.parse(content) as SyncPayload
        if (!data.bookmarks || !Array.isArray(data.bookmarks)) {
          return { ok: false, error: messages.error.invalidFormat() }
        }
        consolo
          .withTag("providers/webdav")
          .info(`Successfully downloaded from ${this.name}`)
        return { ok: true, data }
      } catch {
        return { ok: false, error: messages.error.invalidJson() }
      }
    } catch (error) {
      return this.handleNetworkError(error)
    }
  }

  /**
   * Normalize URL by removing trailing slash
   *
   * @param url - URL to normalize
   *
   * @returns Normalized URL
   */
  private normalizeUrl(url: string): string {
    return url.endsWith("/") ? url.slice(0, -1) : url
  }

  /**
   * Normalize path by ensuring leading slash
   *
   * @param path - Path to normalize
   *
   * @returns Normalized path
   */
  private normalizePath(path: string): string {
    return path.startsWith("/") ? path : `/${path}`
  }

  /**
   * Get authentication headers (Basic Auth)
   *
   * @returns Headers with Basic Auth credentials
   */
  protected getAuthHeaders(): Record<string, string> {
    const credentials = btoa(`${this.username}:${this.password}`)
    return {
      Authorization: `Basic ${credentials}`
    }
  }

  /**
   * Override base headers
   *
   * @returns Empty headers (WebDAV doesn't need default Content-Type)
   */
  protected getBaseHeaders(): Record<string, string> {
    return {}
  }

  /**
   * Get error message by status code
   *
   * @param status - HTTP/WebDAV status code
   *
   * @returns Human-readable error message
   */
  protected getErrorMessage(status: number): string {
    return getWebDAVStatusMessage(status) || this.getHttpErrorMessage(status)
  }

  /**
   * Check if status code indicates success
   *
   * @param status - HTTP status code
   *
   * @returns Whether status is in 2xx range
   */
  protected isSuccess(status: number): boolean {
    return status >= 200 && status < 300
  }

  /**
   * Handle WebDAV-specific errors
   *
   * @param status - HTTP/WebDAV status code
   *
   * @returns Error result
   */
  protected handleWebDAVError(status: number): Result<never> {
    consolo
      .withTag("providers/webdav")
      .error(
        `WebDAV request failed: ${status} - ${this.getErrorMessage(status)}`
      )
    return { ok: false, status, error: this.getErrorMessage(status) }
  }

  /**
   * Ensure parent directory exists
   *
   * @remarks Creates directories recursively using MKCOL
   */
  protected async ensureDirectory(): Promise<void> {
    const lastSlash = this.filePath.lastIndexOf("/")
    const parentPath =
      lastSlash > 0 ? this.filePath.substring(0, lastSlash) : "/"

    if (parentPath === "/") return

    // --- Create parent directories recursively ---
    const parts = parentPath.split("/").filter(Boolean)
    let current = ""
    for (const part of parts) {
      current += `/${part}`
      try {
        await this.request("MKCOL", current)
      } catch {
        // ignore errors
      }
    }
  }
}
