import { useState, useCallback, useEffect } from 'react';
import type { McpServerInfo } from '@wordpress-mcp/shared';
import { UrlForm } from './components/UrlForm/UrlForm';
import { ServerList } from './components/ServerList/ServerList';
import api from './services/api';

function App() {
  const [servers, setServers] = useState<McpServerInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchServers = useCallback(async () => {
    try {
      const data = await api.getMcpServers();
      setServers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load servers';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServers();
  }, [fetchServers]);

  const handleServerCreated = useCallback((server: McpServerInfo) => {
    setServers((prev) => [server, ...prev]);
    setSuccessMessage(
      `Server "${server.siteName || 'WordPress Site'}" created successfully!`,
    );
    setTimeout(() => setSuccessMessage(null), 5000);
  }, []);

  const handleServerDeleted = useCallback((id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id));
    setSuccessMessage('Server deleted successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const handleServerSynced = useCallback((updatedServer: McpServerInfo) => {
    setServers((prev) =>
      prev.map((s) => (s.id === updatedServer.id ? updatedServer : s)),
    );
    setSuccessMessage('Server synced successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            WordPress MCP Server Generator
          </h1>
          <p className="mt-2 text-gray-600">
            Generate MCP servers from WordPress websites to expose posts via the Model Context
            Protocol.
          </p>
        </header>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* URL Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New MCP Server</h2>
          <UrlForm onServerCreated={handleServerCreated} onError={handleError} />
        </div>

        {/* Server List */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active MCP Servers</h2>
            <button
              onClick={fetchServers}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
          {isLoading ? (
            <div className="text-center py-8">
              <svg
                className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-gray-500 mt-2">Loading servers...</p>
            </div>
          ) : (
            <ServerList
              servers={servers}
              onServerDeleted={handleServerDeleted}
              onServerSynced={handleServerSynced}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
