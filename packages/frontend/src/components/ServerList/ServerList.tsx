import { useState, useCallback } from 'react';
import type { McpServerInfo } from '@wordpress-mcp/shared';
import api from '../../services/api';

interface ServerListProps {
  servers: McpServerInfo[];
  onServerDeleted: (id: string) => void;
  onServerSynced: (server: McpServerInfo) => void;
  onError: (error: string) => void;
}

export function ServerList({
  servers,
  onServerDeleted,
  onServerSynced,
  onError,
}: ServerListProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, 'delete' | 'sync' | null>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this MCP server?')) {
        return;
      }

      setLoadingStates((prev) => ({ ...prev, [id]: 'delete' }));

      try {
        await api.deleteMcpServer(id);
        onServerDeleted(id);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete server';
        onError(message);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [id]: null }));
      }
    },
    [onServerDeleted, onError],
  );

  const handleSync = useCallback(
    async (id: string) => {
      setLoadingStates((prev) => ({ ...prev, [id]: 'sync' }));

      try {
        const updatedServer = await api.syncMcpServer(id);
        onServerSynced(updatedServer);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sync server';
        onError(message);
      } finally {
        setLoadingStates((prev) => ({ ...prev, [id]: null }));
      }
    },
    [onServerSynced, onError],
  );

  const handleCopyEndpoint = useCallback(async (server: McpServerInfo) => {
    try {
      await navigator.clipboard.writeText(server.connectionEndpoint);
      setCopiedId(server.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = server.connectionEndpoint;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(server.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  const getStatusBadgeClasses = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'inactive':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (servers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No MCP servers created yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Enter a WordPress URL above to generate your first MCP server.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Site
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Posts
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Connection
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {servers.map((server) => (
            <tr key={server.id} className="hover:bg-gray-50">
              <td className="px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {server.siteName || 'WordPress Site'}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">
                    {server.wordpressUrl}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">ID: {server.id.slice(0, 8)}...</p>
                </div>
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(server.status)}`}
                >
                  {server.status}
                </span>
              </td>
              <td className="px-4 py-4 text-sm text-gray-500">
                {server.postCount ?? 'N/A'}
              </td>
              <td className="px-4 py-4">
                <button
                  onClick={() => handleCopyEndpoint(server)}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-mono bg-blue-50 px-2 py-1 rounded"
                  title="Click to copy connection endpoint"
                >
                  {copiedId === server.id ? (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy Endpoint
                    </>
                  )}
                </button>
              </td>
              <td className="px-4 py-4 text-right text-sm">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleSync(server.id)}
                    disabled={loadingStates[server.id] !== null}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Sync server metadata"
                  >
                    {loadingStates[server.id] === 'sync' ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(server.id)}
                    disabled={loadingStates[server.id] !== null}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete server"
                  >
                    {loadingStates[server.id] === 'delete' ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ServerList;
