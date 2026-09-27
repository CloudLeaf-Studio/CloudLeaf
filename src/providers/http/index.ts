/**
 * HTTP provider module
 *
 * @packageDocumentation
 */

import { messages } from "~/i18n"
import { HttpStatusMessage } from "~constants"
import { BaseProvider } from "~providers"
import { type FailureResult } from "~types"
import { consolo } from "~utils"

/**
 * HTTP method types
 *
 * - `GET` Retrieve resource
 * - `PATCH` Partial update
 * - `PROPFIND` WebDAV property retrieval
 * - `PUT` Create or replace resource
 * - `MKCOL` WebDAV create collection
 */
type Method = "GET" | "PATCH" | "PROPFIND" | "PUT" | "MKCOL"

/**
 * Abstract HTTP protocol provider
 *
 * @remarks Encapsulates common HTTP request logic
 */
export abstract class HttpProvider extends BaseProvider {
  /**
   * Base URL for the server
   */
  protected abstract readonly baseUrl: string

  /**
   * Request timeout in ms
   */
  protected readonly timeout = 30_000

  /**
   * Get authentication headers
   *
   * @returns Headers with auth credentials
   *
   * @remarks Must be implemented by subclasses
   */
  protected abstract getAuthHeaders(): Record<string, string>

  /**
   * Get base request headers
   *
   * @returns Default headers
   */
  protected getBaseHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json; charset=utf-8"
    }
  }

  /**
   * Merge all request headers
   *
   * @returns Combined base and auth headers
   */
  protected getAllHeaders(): Record<string, string> {
    return {
      ...this.getBaseHeaders(),
      ...this.getAuthHeaders()
    }
  }

  /**
   * Send HTTP request
   *
   * @param method - HTTP method
   * @param path - Request path
   * @param options - Optional config (body, headers)
   *
   * @returns Fetch response
   */
  protected async request(
    method: Method,
    path: string,
    options?: {
      body?: unknown
      headers?: Record<string, string>
    }
  ): Promise<Response> {
    const url = `${this.baseUrl}${path}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, this.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.getAllHeaders(),
          ...options?.headers
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        credentials: "omit"
      })
      return response
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Get HTTP error message by status code
   *
   * @param status - HTTP status code
   *
   * @returns Human-readable error message
   */
  protected getHttpErrorMessage(status: number): string {
    return HttpStatusMessage[status] || `Request failed: ${status}`
  }

  /**
   * Handle HTTP error response
   *
   * @param response - HTTP response object
   *
   * @returns Error result
   */
  protected handleError(response: Response): FailureResult {
    return {
      ok: false,
      status: response.status,
      error: this.getHttpErrorMessage(response.status)
    }
  }

  /**
   * Handle network exceptions
   *
   * @param error - Caught error object
   *
   * @returns Error result
   */
  protected handleNetworkError(error: unknown): FailureResult {
    consolo.withTag("providers/http").error("Network error")
    if (error instanceof Error) {
      if (error.name === "AbortError")
        return { ok: false, error: messages.error.timeout() }
      return { ok: false, error: messages.error.network(error.message) }
    }
    return { ok: false, error: messages.error.unknown() }
  }
}
