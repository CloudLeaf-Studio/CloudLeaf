import { createRequire } from "module"
import { pathsToModuleNameMapper } from "ts-jest"

const require = createRequire(import.meta.url)
const tsconfig = require("./tsconfig.json")

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */

const config = {
  setupFiles: ["jest-webextension-mock"],
  testRegex: ["^.+\\.test.tsx?$"],
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: "<rootDir>/"
  }),
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }]
  },
}

export default config
