import { beforeEach, describe, expect, jest, test } from "@jest/globals"

import { CONFIG_KEY } from "~constants"
import { getUserConfig } from "~store"
import { storage } from "~store/storage/utils"
import type {
  CustomVendorConfig,
  GistConfig,
  LegacyUserConfig,
  WebDAVUserConfig
} from "~types"

jest.mock("~store/storage/utils", () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn()
  }
}))

const mockedStorage = jest.mocked(storage)

const gist: GistConfig = {
  enabled: true,
  accessToken: "token",
  gistId: "gist-id",
  fileName: "CloudLeaf.json",
  priority: 0
}

const secondGist: GistConfig = {
  ...gist,
  gistId: "second-gist-id",
  priority: 1
}

const webDav: WebDAVUserConfig = {
  enabled: true,
  vendorId: "jianguoyun",
  username: "user@example.com",
  password: "password",
  filePath: "/CloudLeaf/CloudLeaf.json",
  priority: 2
}

const vendor: CustomVendorConfig = {
  id: "custom",
  name: "Custom WebDAV",
  serverUrl: "https://dav.example.com"
}

describe("getUserConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedStorage.set.mockResolvedValue(undefined)
  })

  test("returns defaults when no persisted config exists", async () => {
    mockedStorage.get.mockResolvedValue(undefined)

    await expect(getUserConfig()).resolves.toEqual({
      gistConfigs: [],
      webDavConfigs: [],
      customVendors: [],
      sync: { autoSyncEnabled: false }
    })
    expect(mockedStorage.set).not.toHaveBeenCalled()
  })

  test("migrates the legacy single Gist configuration", async () => {
    const legacyConfig = {
      gist,
      webDavConfigs: [],
      customVendors: []
    } as LegacyUserConfig
    mockedStorage.get.mockResolvedValue(legacyConfig)

    await expect(getUserConfig()).resolves.toEqual({
      gistConfigs: [gist],
      webDavConfigs: [],
      customVendors: [],
      sync: { autoSyncEnabled: false }
    })
    expect(mockedStorage.set).toHaveBeenCalledWith(CONFIG_KEY, {
      gistConfigs: [gist],
      webDavConfigs: [],
      customVendors: [],
      sync: { autoSyncEnabled: false }
    })
  })

  test("preserves new multi-Gist configuration without migration", async () => {
    const config = {
      gistConfigs: [gist, secondGist],
      webDavConfigs: [webDav],
      customVendors: [vendor],
      sync: { autoSyncEnabled: true }
    }
    mockedStorage.get.mockResolvedValue(config)

    await expect(getUserConfig()).resolves.toEqual(config)
    expect(mockedStorage.set).not.toHaveBeenCalled()
  })

  test("fills missing legacy fields with defaults during migration", async () => {
    mockedStorage.get.mockResolvedValue({ gist } as LegacyUserConfig)

    await expect(getUserConfig()).resolves.toEqual({
      gistConfigs: [gist],
      webDavConfigs: [],
      customVendors: [],
      sync: { autoSyncEnabled: false }
    })
  })

  test("preserves WebDAV, vendors, and sync settings during migration", async () => {
    const legacyConfig = {
      gist,
      webDavConfigs: [webDav],
      customVendors: [vendor],
      sync: { autoSyncEnabled: true }
    } as LegacyUserConfig
    mockedStorage.get.mockResolvedValue(legacyConfig)

    await expect(getUserConfig()).resolves.toEqual({
      gistConfigs: [gist],
      webDavConfigs: [webDav],
      customVendors: [vendor],
      sync: { autoSyncEnabled: true }
    })
  })

  // impossible scenario, but we should handle it gracefully
  test("prefers gistConfigs when both legacy and new fields exist", async () => {
    const config = {
      gist,
      gistConfigs: [secondGist],
      webDavConfigs: [],
      customVendors: [],
      sync: { autoSyncEnabled: false }
    } as LegacyUserConfig
    mockedStorage.get.mockResolvedValue(config)

    await expect(getUserConfig()).resolves.toEqual({
      gistConfigs: [secondGist],
      webDavConfigs: [],
      customVendors: [],
      sync: { autoSyncEnabled: false }
    })
    expect(mockedStorage.set).toHaveBeenCalledWith(CONFIG_KEY, {
      gistConfigs: [secondGist],
      webDavConfigs: [],
      customVendors: [],
      sync: { autoSyncEnabled: false }
    })
  })
})
