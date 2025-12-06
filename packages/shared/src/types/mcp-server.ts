/**
 * MCP Server Status Enum
 * Represents the current operational state of an MCP server instance
 */
export enum McpServerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

/**
 * MCP Server Entity Interface
 * Represents the database entity for an MCP server configuration
 */
export interface McpServerEntity {
  id: string;
  wordpressUrl: string;
  siteName: string | null;
  status: McpServerStatus;
  postCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt: Date | null;
  errorMessage: string | null;
}

/**
 * MCP Server Info DTO
 * Data transfer object for API responses
 */
export interface McpServerInfo {
  id: string;
  wordpressUrl: string;
  siteName: string | null;
  status: McpServerStatus;
  postCount: number | null;
  createdAt: string;
  connectionEndpoint: string;
}

/**
 * Create MCP Server Request DTO
 */
export interface CreateMcpServerRequest {
  wordpressUrl: string;
}
