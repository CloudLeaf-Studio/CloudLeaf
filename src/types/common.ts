/**
 * Generic result wrapper for async operations
 *
 * @typeParam T - The type of data returned on ok
 */
export interface Result<T> {
  /**
   * Whether the operation succeeded
   */
  ok: boolean
  /**
   * Result data, present when ok is true
   */
  data?: T
  /**
   * Status code, if applicable
   */
  status?: number
  /**
   * Error message, present when ok is false
   */
  error?: string
}
