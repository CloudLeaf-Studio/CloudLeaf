/**
 * Base provider module
 *
 * @packageDocumentation
 */

import { type Result, type SyncPayload } from "~types"

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
   * Generate a target key for baseline identity.
   *
   * @returns Non-sensitive provider + data source identifier
   */
  abstract getTargetKey(): string

  /**
   * Validate provider configuration
   *
   * @returns Validation operation result containing the provider validity result
   */
  abstract isValid(): Promise<Result<Result<void>>>

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
