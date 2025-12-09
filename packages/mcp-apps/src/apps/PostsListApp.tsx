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
import { InlineBlogPostGrid, type BlogPost } from '@/components/inline-blog';
import '../global.css';

const APP_INFO = { name: 'WordPress Posts List', version: '1.0.0' };

interface PostsListData {
  items: PostListItem[];
  pagination: PaginationInfo;
}

function mapPostToBlogPost(post: PostListItem): BlogPost {
  return {
    id: String(post.id),
    title: post.title,
    excerpt: post.excerpt.replace(/<[^>]*>/g, ''),
    coverImage: post.featuredImageUrl ?? undefined,
    publishedAt: post.date,
    url: post.link,
    author: {
      name: 'WordPress',
    },
  };
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
      app.ontoolresult = (result) => {
        setToolResult(result);
      };
      app.onerror = (err) => {
        // eslint-disable-next-line no-console
        console.error(err);
      };
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

  useEffect(() => {
    if (toolResult) {
      const parsed = parseToolResult(toolResult);
      if (parsed) {
        setData(parsed);
        setLoading(false);
      }
    }
  }, [toolResult]);

  const fetchPosts = useCallback(
    (page: number) => {
      setLoading(true);
      app
        .callServerTool({
          name: 'list_posts',
          arguments: { page, perPage: 10 },
        })
        .then((result) => {
          const parsed = parseToolResult(result);
          if (parsed) {
            setData(parsed);
            setCurrentPage(page);
          }
        })
        .catch(() => {
          // Silently handle error
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [app],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      fetchPosts(newPage);
    },
    [fetchPosts],
  );

  const handleReadMore = useCallback(
    (blogPost: BlogPost) => {
      app
        .sendMessage({
          role: 'user',
          content: [{ type: 'text', text: `Show me the details for post ID ${blogPost.id}` }],
        })
        .catch(() => {
          // Silently handle error
        });
    },
    [app],
  );

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
    <div className="p-4">
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Posts Carousel */}
      {!loading && data && (
        <>
          {data.items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No posts found.</div>
          ) : (
            <InlineBlogPostGrid
              posts={data.items.map(mapPostToBlogPost)}
              columns={2}
              showAuthor={false}
              showCategory={false}
              onReadMore={handleReadMore}
            />
          )}

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
  </StrictMode>,
);
