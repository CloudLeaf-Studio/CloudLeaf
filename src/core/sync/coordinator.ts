import { E_ALREADY_LOCKED, tryAcquire, type Mutex } from "async-mutex"

import { HttpStatus, WebDAVStatus } from "~constants"
import { getBookmarks, setBookmarks } from "~core/bookmark"
import { getSyncState, getUserConfig, setSyncState } from "~store"
import { actionApi, consolo } from "~utils"

import { withCloudApply, type ApplyingCloudRef } from "./apply"
import { uploadBookmarks } from "./cloud"
import { buildProviders, getSyncStatus } from "./utils"

/**
 * Core reconciliation logic executed within the sync mutex.
 *
 * @param applyingCloud - Mutable flag ref, set to `true` during remote application
 * to suppress feedback loops from bookmark change events
 */
async function reconcileCore(applyingCloud: ApplyingCloudRef): Promise<void> {
  consolo
    .withTag("core/sync/coordinator")
    .info("Running auto-sync reconciliation cycle")

  const config = await getUserConfig()
  if (!config.sync?.autoSyncEnabled) {
    consolo.withTag("core/sync/coordinator").info("Auto-sync is disabled")
    return
  }

  const state = await getSyncState()
  if (state.phase !== "ready") {
    consolo
      .withTag("core/sync/coordinator")
      .info(`Sync is in a ${state.phase} state, instead of ready`)
    return
  }

  const { providers } = await buildProviders(true)
  if (providers.length === 0) return
  const primary = providers[0].provider

  const currentKey = primary.getTargetKey()
  if (state.baseline?.targetKey !== currentKey) {
    state.phase = "uninitialized"
    delete state.baseline
    await setSyncState(state)
    return
  }

  const local = await getBookmarks()
  const cloudRes = await primary.download()

  if (cloudRes.ok === false) {
    if (
      cloudRes.status === HttpStatus.NOT_FOUND ||
      cloudRes.status === WebDAVStatus.CONFLICT
    ) {
      const uploadRes = await uploadBookmarks(local)
      if (uploadRes.ok) {
        state.baseline = {
          targetKey: currentKey,
          contentHash: local.contentHash,
          updatedAt: local.updatedAt
        }
        await setSyncState(state)
      }
    }
    return
  }
  if (!cloudRes.data) return

  const cloud = cloudRes.data
  const status = await getSyncStatus(local, cloud)

  consolo
    .withTag("core/sync/coordinator")
    .info(
      `Sync status: ${status}, with local updatedAt: ${local.updatedAt}, cloud updatedAt: ${cloud.updatedAt}`
    )

  if (status === "synced") {
    consolo
      .withTag("core/sync/coordinator")
      .info(
        "Local and cloud bookmarks are already synced, so no action is needed"
      )

    state.localUpdatedAt = cloud.updatedAt
    state.baseline = {
      targetKey: currentKey,
      contentHash: cloud.contentHash,
      updatedAt: cloud.updatedAt
    }
    await setSyncState(state)
    return
  }

  if (status === "ahead") {
    consolo
      .withTag("core/sync/coordinator")
      .info(
        "Local bookmarks are ahead of cloud, uploading local bookmarks to cloud"
      )

    const uploadRes = await uploadBookmarks(local)
    if (uploadRes.ok === false) return

    const recheck = await getBookmarks()
    if (recheck.contentHash === local.contentHash) {
      state.baseline = {
        targetKey: currentKey,
        contentHash: local.contentHash,
        updatedAt: local.updatedAt
      }
      await setSyncState(state)
    }
    return
  }

  if (status === "behind") {
    consolo
      .withTag("core/sync/coordinator")
      .info(
        "Local bookmarks are behind cloud, applying cloud bookmarks to local"
      )

    await withCloudApply(applyingCloud, () => setBookmarks(cloud))

    state.localUpdatedAt = cloud.updatedAt
    state.baseline = {
      targetKey: currentKey,
      contentHash: cloud.contentHash,
      updatedAt: cloud.updatedAt
    }
    await setSyncState(state)
    return
  }

  if (status === "conflict") {
    consolo
      .withTag("core/sync/coordinator")
      .info(
        "Conflicting changes detected between local and cloud bookmarks with local and cloud",
        local,
        cloud
      )

    state.phase = "conflict"
    await setSyncState(state)
    actionApi.setBadgeText({ text: "!" })
    actionApi.setBadgeBackgroundColor({ color: "#DC2626" })
  }
}

/**
 * Run a full auto-sync reconciliation cycle.
 *
 * Acquires the sync mutex before executing the core reconciliation logic.
 *
 * @param syncMutex - Mutex for concurrency guard
 * @param applyingCloud - Mutable flag ref, passed through to the core logic
 */
export async function reconcileSync(
  syncMutex: Mutex,
  applyingCloud: ApplyingCloudRef
): Promise<void> {
  try {
    await tryAcquire(syncMutex).runExclusive(() => reconcileCore(applyingCloud))
  } catch (e) {
    if (e !== E_ALREADY_LOCKED) throw e
  }
}
