import { useState, FormEvent, useCallback } from 'react';
import type { McpServerInfo, CreateMcpServerRequest } from '@wordpress-mcp/shared';
import api from '../../services/api';

interface UrlFormProps {
  onServerCreated: (server: McpServerInfo) => void;
  onError: (error: string) => void;
}

export function UrlForm({ onServerCreated, onError }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!url.trim()) {
        onError('Please enter a WordPress URL');
        return;
      }

      setIsLoading(true);

      try {
        const request: CreateMcpServerRequest = { wordpressUrl: url.trim() };
        const server = await api.createMcpServer(request);
        onServerCreated(server);
        setUrl('');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Failed to create MCP server';
        onError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [url, onServerCreated, onError],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="wordpress-url"
          className="block text-sm font-medium text-gray-600 mb-2"
        >
          WordPress Site URL
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            id="wordpress-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.wordpress.com"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-teal-400 hover:to-cyan-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-teal-500/25"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              'Generate MCP Server'
            )}
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          Enter a WordPress site URL to generate an agentic MCP interface for your content.
        </p>
      </div>
    </form>
  );
}

export default UrlForm;
