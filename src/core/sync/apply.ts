/**
 * Mutable state indicating whether cloud bookmarks are being applied.
 */
export interface ApplyingCloudRef {
  value: boolean
}

/**
 * Run an operation while suppressing cloud-apply bookmark events.
 *
 * @param applyingCloud - Mutable cloud application state
 * @param apply - Cloud application operation
 *
 * @returns Operation result
 */
export async function withCloudApply<T>(
  applyingCloud: ApplyingCloudRef,
  apply: () => Promise<T>
): Promise<T> {
  applyingCloud.value = true

  try {
    return await apply()
  } catch (e) {
    // TODO: Solve the error in the future, but temporarily suppress error logging to keep running now.
    void e
    // const { consolo } = await import("~utils")
    // consolo.withTag("core/sync/apply").error("Error during cloud apply", e)
  } finally {
    applyingCloud.value = false
  }
}
