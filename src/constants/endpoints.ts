/**
 * GitHub Gist API endpoint constants
 *
 * @readonly
 */
export const GIST_ENDPOINTS = {
  /**
   * Base URL for GitHub API requests
   *
   * @readonly
   */
  BASE_URL: "https://api.github.com",
  /**
   * Path for Gist CRUD operations
   *
   * @readonly
   */
  GIST_PATH: "/gists",
  /**
   * Path for validating access token
   *
   * @readonly
   */
  USER_PATH: "/user"
} as const
