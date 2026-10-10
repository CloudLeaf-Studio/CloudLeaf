import { useState } from "react"
import { toast } from "sonner"

import { DEFAULT_FILENAME } from "~constants"
import { messages } from "~i18n"
import { GistProvider, WebDAVRegistry } from "~providers"
import { type UserConfig } from "~types"

/**
 * Hook for testing connectivity to configured sync providers.
 *
 * @returns
 * - `testingMap`: record of testing states per provider id
 * - `testGist(config, index)`: validate a Gist provider setting
 * - `testWebDav(config, index)`: validate a WebDAV account by index
 */
export const useTest = () => {
  // map of provider id -> whether it's currently being tested
  const [testingMap, setTestingMap] = useState<Record<string, boolean>>({})

  /**
   * Set testing state for a single provider id.
   *
   * @param id - Provider identifier (e.g. 'gist' or 'webdav-0')
   * @param isTesting - Whether the provider is currently being tested
   */
  const setItemTesting = (id: string, isTesting: boolean) => {
    setTestingMap((prev) => ({ ...prev, [id]: isTesting }))
  }

  /**
   * Test Gist provider configuration by attempting to validate credentials.
   *
   * Shows an alert with the result and updates `testingMap` during the check.
   *
   * @param config - User configuration containing `gistConfigs`
   * @param index - Index of the Gist configuration to test
   */
  const testGist = async (config: UserConfig, index: number) => {
    const gist = config.gistConfigs[index]
    if (!gist) return
    const id = `gist-${index}`
    setItemTesting(id, true)
    try {
      const provider = new GistProvider(
        gist.accessToken,
        gist.gistId,
        gist.fileName || DEFAULT_FILENAME
      )
      const res = await provider.isValid()
      if (res.ok === false) {
        toast(messages.alert.gistFailed(res.error || ""))
        return
      }
      if (!res.data) {
        toast(messages.alert.gistFailed(""))
        return
      }
      if (res.data.ok === false) {
        toast(messages.alert.gistFailed(res.data.error || ""))
        return
      }
      toast(messages.alert.gistOk())
    } catch (e) {
      toast(messages.alert.exception(String(e)))
    } finally {
      setItemTesting(id, false)
    }
  }

  /**
   * Test a WebDAV account configuration by index in `config.webDavConfigs`.
   *
   * Shows an alert with the result and updates `testingMap` during the check.
   *
   * @param config - User configuration containing `webDavConfigs`
   * @param index - Index of the WebDAV account to test
   */
  const testWebDav = async (config: UserConfig, index: number) => {
    const acc = config.webDavConfigs[index]
    if (!acc) return
    const id = `webdav-${index}`
    setItemTesting(id, true)
    try {
      const provider = WebDAVRegistry.createProvider(acc.vendorId, acc)
      const res = await provider.isValid()
      if (res.ok === false) {
        toast(messages.alert.webdavFailed(res.error || ""))
        return
      }
      if (!res.data) {
        toast(messages.alert.webdavFailed(""))
        return
      }
      if (res.data.ok === false) {
        toast(messages.alert.webdavFailed(res.data.error || ""))
        return
      }
      toast(messages.alert.webdavOk(acc.username))
    } catch (e) {
      toast(messages.alert.exception(String(e)))
    } finally {
      setItemTesting(id, false)
    }
  }

  return { testingMap, testGist, testWebDav }
}
