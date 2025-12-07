/**
 * Posts List MCP App
 * Interactive list view for WordPress posts displayed in MCP host clients
 */
import type { App } from '@modelcontextprotocol/ext-apps';
import { useApp } from '@modelcontextprotocol/ext-apps/react';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { StrictMode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { PostListItem, PaginationInfo } from '@wordpress-mcp/shared';
import '../global.css';

const APP_INFO = { name: 'WordPress Posts List', version: '1.0.0' };

interface PostsListData {
  items: PostListItem[];
  pagination: PaginationInfo;
}

function parseToolResult(result: CallToolResult): PostsListData | null {
  // Data comes via structuredContent, not the text content
  if (result.structuredContent) {
    return result.structuredContent as unknown as PostsListData;
  }
  return null;
}

function PostsListApp() {
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

  return <PostsListContent app={app} toolResult={toolResult} />;
}

interface PostsListContentProps {
  app: App;
  toolResult: CallToolResult | null;
}

function PostsListContent({ app, toolResult }: PostsListContentProps) {
  const [data, setData] = useState<PostsListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (toolResult) {
      const parsed = parseToolResult(toolResult);
      if (parsed) {
        setData(parsed);
        setLoading(false);
      }
    }
  }, [toolResult]);

  const fetchPosts = useCallback(async (page: number, search?: string) => {
    setLoading(true);
    try {
      const result = await app.callServerTool({
        name: 'list_posts',
        arguments: {
          page,
          perPage: 10,
          ...(search ? { search } : {}),
        },
      });
      const parsed = parseToolResult(result);
      if (parsed) {
        setData(parsed);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  }, [app]);

  const handleSearch = useCallback(() => {
    fetchPosts(1, searchQuery);
  }, [fetchPosts, searchQuery]);

  const handlePageChange = useCallback((newPage: number) => {
    fetchPosts(newPage, searchQuery);
  }, [fetchPosts, searchQuery]);

  const handlePostClick = useCallback(async (postId: number) => {
    try {
      await app.sendMessage({
        role: 'user',
        content: [{ type: 'text', text: `Show me the details for post ID ${postId}` }],
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [app]);

  const handleOpenLink = useCallback(async (url: string) => {
    try {
      await app.sendOpenLink({ url });
    } catch (err) {
      console.error('Failed to open link:', err);
    }
  }, [app]);

  if (!data && !loading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500 mb-4">No posts data received yet.</div>
        <button
          onClick={() => fetchPosts(1)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          Load Posts
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Search Bar */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search posts..."
          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Posts List */}
      {!loading && data && (
        <>
          <div className="space-y-3">
            {data.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No posts found matching your criteria.
              </div>
            ) : (
              data.items.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onClick={() => handlePostClick(post.id)}
                  onOpenLink={() => handleOpenLink(post.link)}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <Pagination
              pagination={data.pagination}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              disabled={loading}
            />
          )}
        </>
      )}
    </div>
  );
}

interface PostCardProps {
  post: PostListItem;
  onClick: () => void;
  onOpenLink: () => void;
}

function PostCard({ post, onClick, onOpenLink }: PostCardProps) {
  return (
    <article className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer">
      <div onClick={onClick}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 mb-2 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {post.excerpt.replace(/<[^>]*>/g, '')}
        </p>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(post.date).toLocaleDateString()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenLink();
          }}
          className="flex items-center gap-1 text-teal-600 hover:text-teal-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open
        </button>
      </div>
    </article>
  );
}

interface PaginationProps {
  pagination: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
  disabled: boolean;
}

function Pagination({ pagination, currentPage, onPageChange, disabled }: PaginationProps) {
  return (
    <div className="mt-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} of {pagination.totalPages} ({pagination.total} posts)
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={disabled || !pagination.hasPreviousPage}
          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={disabled || !pagination.hasNextPage}
          className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Mount the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostsListApp />
  </StrictMode>
);
