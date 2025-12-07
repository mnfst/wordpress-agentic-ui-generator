import { useState, useCallback, useEffect } from 'react';
import type { McpServerInfo } from '@wordpress-mcp/shared';
import { LandingPage } from './components/LandingPage/LandingPage';
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
    <div className="relative">
      {/* Floating Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-teal-50 backdrop-blur border border-teal-200 rounded-lg text-teal-800 flex items-center gap-2 shadow-lg animate-slide-in">
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
          <div className="p-4 bg-red-50 backdrop-blur border border-red-200 rounded-lg text-red-800 flex items-center gap-2 shadow-lg animate-slide-in">
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
      </div>

      {/* Main Content */}
      <LandingPage
        onServerCreated={handleServerCreated}
        onError={handleError}
        servers={servers}
        onServerDeleted={handleServerDeleted}
        onServerSynced={handleServerSynced}
        isLoading={isLoading}
      />
    </div>
  );
}

export default App;
