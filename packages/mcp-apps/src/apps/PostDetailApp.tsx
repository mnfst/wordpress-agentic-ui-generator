/**
 * Post Detail MCP App
 * Rich detail view for a single WordPress post displayed in MCP host clients
 */
import type { App } from '@modelcontextprotocol/ext-apps';
import { useApp } from '@modelcontextprotocol/ext-apps/react';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PostDetail } from '@wordpress-mcp/shared';
import '../global.css';

const APP_INFO = { name: 'WordPress Post Detail', version: '1.0.0' };

function parseToolResult(result: CallToolResult): PostDetail | null {
  // Data comes via structuredContent, not the text content
  if (result.structuredContent) {
    return result.structuredContent as unknown as PostDetail;
  }
  return null;
}

function PostDetailApp() {
  const [toolResult, setToolResult] = useState<CallToolResult | null>(null);
  const { app, error } = useApp({
    appInfo: APP_INFO,
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolresult = async (result) => {
        setToolResult(result);
      };
      app.onerror = console.error;
    },
  });

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        <strong>Connection Error:</strong> {error.message}
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-500">Connecting to host...</div>
      </div>
    );
  }

  return <PostDetailContent app={app} toolResult={toolResult} />;
}

interface PostDetailContentProps {
  app: App;
  toolResult: CallToolResult | null;
}

function PostDetailContent({ app, toolResult }: PostDetailContentProps) {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (toolResult) {
      const parsed = parseToolResult(toolResult);
      if (parsed) {
        setPost(parsed);
        setLoading(false);
      }
    }
  }, [toolResult]);

  const handleOpenLink = useCallback(async (url: string) => {
    try {
      await app.sendOpenLink({ url });
    } catch (err) {
      console.error('Failed to open link:', err);
    }
  }, [app]);

  const handleGoBack = useCallback(async () => {
    try {
      await app.sendMessage({
        role: 'user',
        content: [{ type: 'text', text: 'Show me the list of posts' }],
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [app]);

  if (!post && !loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        <div className="mb-4">No post data received yet.</div>
        <div className="text-sm">Post details will appear here when loaded.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="max-w-3xl mx-auto p-4">
      {/* Back Button */}
      <button
        onClick={handleGoBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to posts
      </button>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-6 rounded-xl overflow-hidden shadow-lg">
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt || post.title}
            className="w-full h-auto object-cover max-h-96"
          />
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
        {post.title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        {post.author && (
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {post.author.name}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
        <button
          onClick={() => handleOpenLink(post.link)}
          className="flex items-center gap-1 text-teal-600 hover:text-teal-500 transition-colors ml-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View Original
        </button>
      </div>

      {/* Categories and Tags */}
      {(post.categories.length > 0 || post.tags.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {post.categories.map((cat) => (
            <span
              key={cat.id}
              className="px-3 py-1 text-xs font-medium bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full"
            >
              {cat.name}
            </span>
          ))}
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Post ID: {post.id}
        </span>
        {post.modified !== post.date && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Updated: {new Date(post.modified).toLocaleDateString()}
          </span>
        )}
      </div>
    </article>
  );
}

// Mount the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostDetailApp />
  </StrictMode>
);
