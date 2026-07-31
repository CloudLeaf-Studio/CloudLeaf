/**
 * Successful operation result.
 *
 * @typeParam T - Successful result data type
 */
export type SuccessResult<T> = {
  /**
   * Successful operation marker
   */
  ok: true
  /**
   * Optional result data
   */
  data?: T
}

/**
 * Failed operation result.
 */
export type FailureResult = {
  /**
   * Failed operation marker
   */
  ok: false
  /**
   * Optional status code
   */
  status?: number
  /**
   * Optional error message
   */
  error?: string
}

/**
 * Generic result wrapper for async operations.
 *
 * @typeParam T - Successful result data type
 */
export type Result<T> = SuccessResult<T> | FailureResult
