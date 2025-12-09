import type { McpServerInfo, CreateMcpServerRequest } from '@wordpress-mcp/shared';
import { API_PATHS } from '@wordpress-mcp/shared';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = (await response.json()) as ApiError;
      throw new Error(errorData.message || 'An error occurred');
    }

    return response.json() as Promise<T>;
  }

  async createMcpServer(data: CreateMcpServerRequest): Promise<McpServerInfo> {
    return this.request<McpServerInfo>(API_PATHS.MCP_SERVERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMcpServers(): Promise<McpServerInfo[]> {
    return this.request<McpServerInfo[]>(API_PATHS.MCP_SERVERS);
  }

  async getMcpServer(id: string): Promise<McpServerInfo> {
    return this.request<McpServerInfo>(`${API_PATHS.MCP_SERVERS}/${id}`);
  }

  async deleteMcpServer(id: string): Promise<void> {
    await this.request<void>(`${API_PATHS.MCP_SERVERS}/${id}`, {
      method: 'DELETE',
    });
  }

  async syncMcpServer(id: string): Promise<McpServerInfo> {
    return this.request<McpServerInfo>(`${API_PATHS.MCP_SERVERS}/${id}/sync`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
export default api;
