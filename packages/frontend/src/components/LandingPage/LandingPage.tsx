import { useCallback, useState } from 'react';
import type { McpServerInfo } from '@wordpress-mcp/shared';
import { UrlForm } from '../UrlForm/UrlForm';
import { ServerList } from '../ServerList/ServerList';

// Import local logo assets

interface LandingPageProps {
  onServerCreated: (server: McpServerInfo) => void;
  onError: (error: string) => void;
  servers: McpServerInfo[];
  onServerDeleted: (id: string) => void;
  onServerSynced: (server: McpServerInfo) => void;
  isLoading: boolean;
}

export function LandingPage({
  onServerCreated,
  onError,
  servers,
  onServerDeleted,
  onServerSynced,
  isLoading,
}: LandingPageProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleServerCreated = useCallback(
    (server: McpServerInfo) => {
      onServerCreated(server);
    },
    [onServerCreated],
  );

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  return (
    <div className="min-h-screen bg-[#FEEBD6] text-gray-800">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 pt-12 pb-12">
        {/* Large Peacock Logo */}
        <div className="flex justify-center mb-8">
          <img
            src="https://manifest.build/assets/images/logomark/logo-sand.png"
            alt="Manifest Peacock Logo"
            className="w-40 h-40 md:w-52 md:h-52"
          />
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-[#1E3A5F] via-[#0D9488] to-[#059669] bg-clip-text text-transparent leading-[1.1]">
            WordPress MCP App Generator
          </h1>
          <p className="text-xl md:text-2xl font-medium text-gray-700 max-w-3xl mx-auto mb-4">
            Bring your WordPress website into your AI assistant.
          </p>
          <p className="text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            This demo uses experimental{' '}
            <a
              href="https://github.com/modelcontextprotocol/ext-apps"
              target="_blank"
              className="text-[#0D9488] hover:text-[#059669] font-medium"
            >
              MCP Apps
            </a>{' '}
            to bring WordPress content into AI assistants via the Model Context Protocol .{' '}
            <a
              href="https://github.com/mnfst/wordpress-agentic-ui-generator"
              target="_blank"
              className="text-[#0D9488] hover:text-[#059669] font-medium"
            >
              View the source code on GitHub.
            </a>
          </p>
        </div>

        {/* Video Demo Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
            {isVideoPlaying ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/l7-A_eulSjQ?autoplay=1&rel=0"
                title="WordPress MCP App Generator Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button
                onClick={handlePlayVideo}
                className="absolute inset-0 w-full h-full group cursor-pointer"
                aria-label="Play demo video"
              >
                {/* YouTube Thumbnail - using i.ytimg.com for better quality */}
                <img
                  src="https://i.ytimg.com/vi/l7-A_eulSjQ/hq720.jpg"
                  alt="Demo video thumbnail"
                  className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white/90 group-hover:bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all">
                    <svg
                      className="w-10 h-10 md:w-12 md:h-12 text-gray-800 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                {/* Watch Demo Label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <span className="bg-white/90 text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-md">
                    Watch the demo (45 sec)
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Main CTA - Form */}
        <div className="max-w-3xl mx-auto mb-16">
          {/* Form Card */}
          <div className="bg-white/70 backdrop-blur border border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="w-8 h-8 text-gray-500"
                viewBox="0 0 122.52 122.523"
                fill="currentColor"
              >
                <path d="M8.708,61.26c0,20.802,12.089,38.779,29.619,47.298L13.258,39.872C10.342,46.408,8.708,53.63,8.708,61.26z M96.74,58.608c0-6.495-2.333-10.993-4.334-14.494c-2.664-4.329-5.161-7.995-5.161-12.324c0-4.831,3.664-9.328,8.825-9.328 c0.233,0,0.454,0.029,0.681,0.042c-9.35-8.566-21.807-13.796-35.489-13.796c-18.36,0-34.513,9.42-43.91,23.688 c1.233,0.037,2.395,0.063,3.382,0.063c5.497,0,14.006-0.667,14.006-0.667c2.833-0.167,3.167,3.994,0.337,4.329 c0,0-2.847,0.335-6.015,0.501L48.2,93.547l11.501-34.493l-8.188-22.434c-2.83-0.166-5.511-0.501-5.511-0.501 c-2.832-0.166-2.5-4.496,0.332-4.329c0,0,8.679,0.667,13.843,0.667c5.496,0,14.006-0.667,14.006-0.667 c2.835-0.167,3.168,3.994,0.337,4.329c0,0-2.853,0.335-6.015,0.501l18.992,56.494l5.242-17.517 C95.042,68.693,96.74,63.439,96.74,58.608z M61.885,64.839L45.166,114.08c4.997,1.47,10.27,2.274,15.727,2.274 c6.483,0,12.699-1.115,18.479-3.153c-0.148-0.24-0.282-0.498-0.396-0.777L61.885,64.839z M107.376,36.046 c0.226,1.674,0.354,3.471,0.354,5.404c0,5.333-0.996,11.328-3.996,18.824l-16.053,46.413c15.624-9.111,26.133-26.038,26.133-45.426 C113.813,52.109,111.477,43.575,107.376,36.046z M61.262,0C27.483,0,0,27.481,0,61.26c0,33.783,27.483,61.263,61.262,61.263 c33.778,0,61.265-27.48,61.265-61.263C122.526,27.481,95.04,0,61.262,0z M61.262,119.715c-32.23,0-58.453-26.223-58.453-58.455 c0-32.23,26.222-58.451,58.453-58.451c32.229,0,58.45,26.221,58.45,58.451C119.712,93.492,93.491,119.715,61.262,119.715z" />
              </svg>
              <span className="text-lg font-medium text-gray-700">
                Connect your own WordPress site
              </span>
            </div>
            <UrlForm onServerCreated={handleServerCreated} onError={onError} />
          </div>
        </div>

        {/* MCP Servers List */}
        {servers.length > 0 && (
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-4 text-gray-800 tracking-tight">
              Popular MCP servers
            </h2>
            <p className="text-gray-500 text-center mb-8 max-w-2xl mx-auto leading-relaxed">
              Add those popular MCP servers to your AI assistant and start exploring your WordPress
              content.
            </p>
            <div className="max-w-3xl mx-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-teal-500 mx-auto"
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
                  onServerDeleted={onServerDeleted}
                  onServerSynced={onServerSynced}
                  onError={onError}
                />
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-8 mt-16">
          <div className="flex justify-center items-center gap-4 mb-6">
            <svg className="w-8 h-8 text-gray-400" viewBox="0 0 122.52 122.523" fill="currentColor">
              <path d="M8.708,61.26c0,20.802,12.089,38.779,29.619,47.298L13.258,39.872C10.342,46.408,8.708,53.63,8.708,61.26z M96.74,58.608c0-6.495-2.333-10.993-4.334-14.494c-2.664-4.329-5.161-7.995-5.161-12.324c0-4.831,3.664-9.328,8.825-9.328 c0.233,0,0.454,0.029,0.681,0.042c-9.35-8.566-21.807-13.796-35.489-13.796c-18.36,0-34.513,9.42-43.91,23.688 c1.233,0.037,2.395,0.063,3.382,0.063c5.497,0,14.006-0.667,14.006-0.667c2.833-0.167,3.167,3.994,0.337,4.329 c0,0-2.847,0.335-6.015,0.501L48.2,93.547l11.501-34.493l-8.188-22.434c-2.83-0.166-5.511-0.501-5.511-0.501 c-2.832-0.166-2.5-4.496,0.332-4.329c0,0,8.679,0.667,13.843,0.667c5.496,0,14.006-0.667,14.006-0.667 c2.835-0.167,3.168,3.994,0.337,4.329c0,0-2.853,0.335-6.015,0.501l18.992,56.494l5.242-17.517 C95.042,68.693,96.74,63.439,96.74,58.608z M61.885,64.839L45.166,114.08c4.997,1.47,10.27,2.274,15.727,2.274 c6.483,0,12.699-1.115,18.479-3.153c-0.148-0.24-0.282-0.498-0.396-0.777L61.885,64.839z M107.376,36.046 c0.226,1.674,0.354,3.471,0.354,5.404c0,5.333-0.996,11.328-3.996,18.824l-16.053,46.413c15.624-9.111,26.133-26.038,26.133-45.426 C113.813,52.109,111.477,43.575,107.376,36.046z M61.262,0C27.483,0,0,27.481,0,61.26c0,33.783,27.483,61.263,61.262,61.263 c33.778,0,61.265-27.48,61.265-61.263C122.526,27.481,95.04,0,61.262,0z M61.262,119.715c-32.23,0-58.453-26.223-58.453-58.455 c0-32.23,26.222-58.451,58.453-58.451c32.229,0,58.45,26.221,58.45,58.451C119.712,93.492,93.491,119.715,61.262,119.715z" />
            </svg>
            <span className="text-gray-400">+</span>
            <img
              src="https://manifest.build/assets/images/logomark/logo-sand.png"
              alt="Manifest"
              className="w-8 h-8"
            />
          </div>
          <div className="text-center text-gray-500">
            <p className="mb-2">
              Built with{' '}
              <a
                href="https://ui.manifest.build"
                target="_blank"
                className="text-[#0D9488] hover:text-[#059669] font-medium"
              >
                Manifest Agentic UI Toolkit
              </a>{' '}
              and the{' '}
              <a
                href="https://modelcontextprotocol.io"
                target="_blank"
                className="text-[#0D9488] hover:text-[#059669] font-medium"
              >
                Model Context Protocol
              </a>
            </p>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} MNFST, Inc. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
