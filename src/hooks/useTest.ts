import { useState } from "react"
import { toast } from "sonner"

import { messages } from "~/src/i18n"
import { GistProvider, WebDAVRegistry } from "~src/providers"
import { type UserConfig } from "~src/types"

/**
 * Hook for testing connectivity to configured sync providers.
 *
 * @returns
 * - `testingMap`: record of testing states per provider id
 * - `testGist(config)`: validate Gist provider settings
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
   * @param config - User configuration containing `gist` settings
   */
  const testGist = async (config: UserConfig) => {
    if (!config?.gist) return
    const id = "gist"
    setItemTesting(id, true)
    try {
      const provider = new GistProvider(
        config.gist.accessToken,
        config.gist.gistId,
        config.gist.fileName
      )
      const res = await provider.isValid()
      toast(
        res.ok && res.data
          ? messages.alert.gistOk()
          : messages.alert.gistFailed(res.error || "")
      )
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
    const acc = config?.webDavConfigs?.[index]
    if (!acc) return
    const id = `webdav-${index}`
    setItemTesting(id, true)
    try {
      const provider = WebDAVRegistry.createProvider(acc.vendorId, acc)
      const res = await provider.isValid()
      toast(
        res.ok && res.data
          ? messages.alert.webdavOk(acc.username)
          : messages.alert.webdavFailed(res.error || "")
      )
    } catch (e) {
      toast(messages.alert.exception(String(e)))
    } finally {
      setItemTesting(id, false)
    }
  }

  return { testingMap, testGist, testWebDav }
}
