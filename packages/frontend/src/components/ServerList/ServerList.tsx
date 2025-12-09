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
        return 'bg-teal-100 text-teal-700 border border-teal-200';
      case 'error':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'inactive':
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  if (servers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No MCP servers created yet.</p>
        <p className="text-sm text-gray-400 mt-2">
          Enter a WordPress URL above to generate your first agentic interface.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <div
          key={server.id}
          className="bg-white/80 backdrop-blur border border-gray-200 rounded-xl p-4 hover:border-teal-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {/* WordPress Icon */}
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 122.52 122.523" fill="currentColor">
                  <path d="M8.708,61.26c0,20.802,12.089,38.779,29.619,47.298L13.258,39.872C10.342,46.408,8.708,53.63,8.708,61.26z M96.74,58.608c0-6.495-2.333-10.993-4.334-14.494c-2.664-4.329-5.161-7.995-5.161-12.324c0-4.831,3.664-9.328,8.825-9.328 c0.233,0,0.454,0.029,0.681,0.042c-9.35-8.566-21.807-13.796-35.489-13.796c-18.36,0-34.513,9.42-43.91,23.688 c1.233,0.037,2.395,0.063,3.382,0.063c5.497,0,14.006-0.667,14.006-0.667c2.833-0.167,3.167,3.994,0.337,4.329 c0,0-2.847,0.335-6.015,0.501L48.2,93.547l11.501-34.493l-8.188-22.434c-2.83-0.166-5.511-0.501-5.511-0.501 c-2.832-0.166-2.5-4.496,0.332-4.329c0,0,8.679,0.667,13.843,0.667c5.496,0,14.006-0.667,14.006-0.667 c2.835-0.167,3.168,3.994,0.337,4.329c0,0-2.853,0.335-6.015,0.501l18.992,56.494l5.242-17.517 C95.042,68.693,96.74,63.439,96.74,58.608z M61.885,64.839L45.166,114.08c4.997,1.47,10.27,2.274,15.727,2.274 c6.483,0,12.699-1.115,18.479-3.153c-0.148-0.24-0.282-0.498-0.396-0.777L61.885,64.839z M107.376,36.046 c0.226,1.674,0.354,3.471,0.354,5.404c0,5.333-0.996,11.328-3.996,18.824l-16.053,46.413c15.624-9.111,26.133-26.038,26.133-45.426 C113.813,52.109,111.477,43.575,107.376,36.046z M61.262,0C27.483,0,0,27.481,0,61.26c0,33.783,27.483,61.263,61.262,61.263 c33.778,0,61.265-27.48,61.265-61.263C122.526,27.481,95.04,0,61.262,0z M61.262,119.715c-32.23,0-58.453-26.223-58.453-58.455 c0-32.23,26.222-58.451,58.453-58.451c32.229,0,58.45,26.221,58.45,58.451C119.712,93.492,93.491,119.715,61.262,119.715z"/>
                </svg>
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {server.siteName || 'WordPress Site'}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(server.status)}`}
                >
                  {server.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate mb-1">
                {server.wordpressUrl}
              </p>
              <p className="text-xs text-gray-400">
                Slug: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-teal-600 font-medium">{server.slug}</code>
                <span className="mx-2">|</span>
                Posts: <span className="text-gray-600 font-medium">{server.postCount ?? 'N/A'}</span>
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => void handleSync(server.id)}
                disabled={loadingStates[server.id] !== null}
                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Sync server metadata"
              >
                {loadingStates[server.id] === 'sync' ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                onClick={() => void handleDelete(server.id)}
                disabled={loadingStates[server.id] !== null}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Delete server"
              >
                {loadingStates[server.id] === 'delete' ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>

          {/* Connection Endpoint */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-wider flex-shrink-0">Endpoint:</span>
              <button
                onClick={() => void handleCopyEndpoint(server)}
                className="flex-1 flex items-center gap-2 text-sm font-mono text-teal-700 bg-teal-50 px-3 py-2 rounded-lg hover:bg-teal-100 transition-colors group border border-teal-100"
                title="Click to copy connection endpoint"
              >
                <span className="truncate flex-1 text-left">{server.connectionEndpoint}</span>
                {copiedId === server.id ? (
                  <span className="flex items-center gap-1 text-teal-600 flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400 group-hover:text-teal-600 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ServerList;
