import { Storage } from "@plasmohq/storage"

/**
 * Shared Plasmo storage instance.
 *
 * @readonly
 */
export const storage = new Storage({
  area: "local"
})
