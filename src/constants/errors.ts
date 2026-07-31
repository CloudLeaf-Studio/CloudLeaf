import { t } from "~i18n"

/**
 * HTTP protocol status codes (RFC 7231)
 *
 * @readonly
 */
export const HttpStatus = {
  // --- Success ---
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // --- Client Errors ---
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,

  // --- Server Errors ---
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const

/**
 * WebDAV protocol extended status codes (RFC 4918)
 *
 * @remarks Only includes WebDAV-specific codes, not general HTTP codes
 *
 * @readonly
 */
export const WebDAVStatus = {
  // --- WebDAV Success ---
  MULTI_STATUS: 207,

  // --- WebDAV Client Errors ---
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  UNSUPPORTED_MEDIA_TYPE: 415,
  LOCKED: 423,

  // --- WebDAV Server Errors ---
  INSUFFICIENT_STORAGE: 507
} as const

/**
 * HTTP status code to i18n message key mapping
 *
 * @internal
 */
const httpStatusKeys: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "http_bad_request",
  [HttpStatus.UNAUTHORIZED]: "http_unauthorized",
  [HttpStatus.FORBIDDEN]: "http_forbidden",
  [HttpStatus.NOT_FOUND]: "http_not_found",
  [HttpStatus.METHOD_NOT_ALLOWED]: "http_method_not_allowed",
  [HttpStatus.INTERNAL_SERVER_ERROR]: "http_internal_server_error",
  [HttpStatus.BAD_GATEWAY]: "http_bad_gateway",
  [HttpStatus.SERVICE_UNAVAILABLE]: "http_service_unavailable",
  [HttpStatus.GATEWAY_TIMEOUT]: "http_gateway_timeout"
}

/**
 * WebDAV status code to i18n message key mapping
 *
 * @internal
 */
const webdavStatusKeys: Record<number, string> = {
  [WebDAVStatus.MULTI_STATUS]: "webdav_multi_status",
  [WebDAVStatus.CONFLICT]: "webdav_conflict",
  [WebDAVStatus.PRECONDITION_FAILED]: "webdav_precondition_failed",
  [WebDAVStatus.UNSUPPORTED_MEDIA_TYPE]: "webdav_unsupported_media_type",
  [WebDAVStatus.LOCKED]: "webdav_locked",
  [WebDAVStatus.INSUFFICIENT_STORAGE]: "webdav_insufficient_storage"
}

/**
 * Get HTTP error message by status code (i18n)
 *
 * @param status - HTTP status code
 *
 * @returns Localized error message
 */
export const getHttpStatusMessage = (status: number): string => {
  const key = httpStatusKeys[status]
  return key ? t(key) : t("http_request_failed", String(status))
}

/**
 * Get WebDAV error message by status code (i18n)
 *
 * @param status - WebDAV status code
 *
 * @returns Localized error message
 */
export const getWebDAVStatusMessage = (status: number): string => {
  const key = webdavStatusKeys[status]
  return key ? t(key) : t("webdav_error", String(status))
}

/**
 * HTTP status code to error message (legacy, for backward compatibility)
 *
 * @deprecated Use getHttpStatusMessage() for i18n support
 * @readonly
 */
export const HttpStatusMessage: Record<number, string> = new Proxy(
  {},
  {
    get: (_, prop) => {
      const status = Number(prop)
      return getHttpStatusMessage(status)
    }
  }
)

/**
 * WebDAV extended status code to error message (legacy, for backward compatibility)
 *
 * @deprecated Use getWebDAVStatusMessage() for i18n support
 * @readonly
 */
export const WebDAVStatusMessage: Record<number, string> = new Proxy(
  {},
  {
    get: (_, prop) => {
      const status = Number(prop)
      return getWebDAVStatusMessage(status)
    }
  }
)
