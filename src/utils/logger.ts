import { createConsolo } from "@yingluan/consolo"

/**
 * Supported scope values for consolo tagging.
 *
 * @remarks Keep this list synchronized with actual module paths used in consolo calls.
 */
type LogScope =
  | "background"
  | "background/messages/triggerSync"
  | "components/AutoSyncSettings"
  | "core/bookmark/io"
  | "core/sync/cloud"
  | "core/sync/coordinator"
  | "core/sync/local"
  | "hooks/useSync"
  | "popup"
  | "providers/gist"
  | "providers/http"
  | "providers/webdav"
  | "utils/logger"

/**
 * consolo tag type used by {@link consolo}.
 *
 * - `LogScope` Restricts tags to predefined module scopes
 */
type LogTag = LogScope

/**
 * Shared Consolo instance for app-wide usage.
 *
 * @readonly
 */
export const consolo = createConsolo<LogTag>({
  isDev: process.env.NODE_ENV === "development"
})
