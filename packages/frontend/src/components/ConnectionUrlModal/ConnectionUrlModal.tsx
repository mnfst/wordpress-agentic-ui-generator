import { useState, useCallback } from 'react';
import { Modal } from '../Modal';

interface ConnectionUrlModalProps {
  connectionUrl: string;
  siteName?: string | null;
  onClose: () => void;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export function ConnectionUrlModal({ connectionUrl, siteName, onClose }: ConnectionUrlModalProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(connectionUrl);
    setCopyStatus(success ? 'success' : 'error');
    if (success) {
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  }, [connectionUrl]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={siteName ? `${siteName} - MCP Server Created` : 'MCP Server Created'}
    >
      <div className="space-y-4">
        <p className="text-gray-600">
          Your MCP server has been created successfully. Use the connection URL below to connect
          your AI assistant.
        </p>

        {/* URL display with copy */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-500 mb-2">Connection URL</label>
          <div className="flex items-start gap-2">
            <code className="flex-1 text-sm text-gray-800 break-all font-mono bg-white px-3 py-2 rounded-lg border border-gray-200 select-all">
              {connectionUrl}
            </code>
            <button
              onClick={() => void handleCopy()}
              className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all ${
                copyStatus === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : copyStatus === 'error'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
              disabled={copyStatus === 'success'}
            >
              {copyStatus === 'success' ? (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Copied
                </span>
              ) : copyStatus === 'error' ? (
                'Failed'
              ) : (
                'Copy'
              )}
            </button>
          </div>
          {copyStatus === 'error' && (
            <p className="mt-2 text-sm text-red-600">
              Failed to copy. Please select the URL above and copy manually.
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-500">
          <p>
            Add this URL to your MCP-compatible AI assistant to start exploring your WordPress
            content.
          </p>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConnectionUrlModal;
