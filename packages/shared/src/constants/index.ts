/**
 * API Path Constants
 */
export const API_PATHS = {
  MCP_SERVERS: '/api/mcp-servers',
  HEALTH: '/api/health',
} as const;

/**
 * WordPress REST API Constants
 */
export const WORDPRESS_API = {
  BASE_PATH: '/wp-json/wp/v2',
  POSTS_ENDPOINT: '/posts',
  USERS_ENDPOINT: '/users',
  MEDIA_ENDPOINT: '/media',
  CATEGORIES_ENDPOINT: '/categories',
  TAGS_ENDPOINT: '/tags',
} as const;

/**
 * Pagination Defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
  MAX_PER_PAGE: 100,
} as const;

/**
 * Validation Constants
 */
export const VALIDATION = {
  EXCERPT_MAX_LENGTH: 150,
  URL_TIMEOUT_MS: 10000,
} as const;

/**
 * MCP Server Configuration
 */
export const MCP_CONFIG = {
  SERVER_VERSION: '1.0.0',
  TRANSPORT: 'sse',
} as const;
