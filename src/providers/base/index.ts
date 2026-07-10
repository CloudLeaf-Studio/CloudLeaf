/**
 * Base provider module
 *
 * @packageDocumentation
 */

import { type Result, type SyncPayload } from "~/src/types"

/**
 * Abstract base class for storage providers
 *
 * @remarks Defines the contract all providers must implement
 */
export abstract class BaseProvider {
  /**
   * Unique provider identifier
   */
  abstract readonly id: string

  /**
   * Display name
   */
  abstract readonly name: string

  /**
   * Validate provider configuration
   *
   * @returns Whether configuration is valid
   */
  abstract isValid(): Promise<Result<boolean>>

  /**
   * Upload bookmarks to cloud
   *
   * @param data - Bookmark payload
   */
  abstract upload(data: SyncPayload): Promise<Result<void>>

  /**
   * Download bookmarks from cloud
   *
   * @returns Bookmark payload
   */
  abstract download(): Promise<Result<SyncPayload>>
}
