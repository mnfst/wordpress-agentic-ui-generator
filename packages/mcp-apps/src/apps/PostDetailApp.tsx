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
import { InlineArticleDetail, type BlogPost } from '@/components/inline-blog';
import '../global.css';

const APP_INFO = { name: 'WordPress Post Detail', version: '1.0.0' };

function parseToolResult(result: CallToolResult): PostDetail | null {
  // Data comes via structuredContent, not the text content
  if (result.structuredContent) {
    return result.structuredContent as unknown as PostDetail;
  }
  return null;
}

function mapPostToBlogPost(post: PostDetail): BlogPost {
  return {
    id: String(post.id),
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    coverImage: post.featuredImage?.url,
    author: {
      name: post.author?.name ?? 'WordPress',
    },
    publishedAt: post.date,
    tags: post.tags.map((t) => t.name),
    category: post.categories[0]?.name,
    url: post.link,
  };
}

function PostDetailApp() {
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

  const handleGoBack = useCallback(() => {
    app
      .sendMessage({
        role: 'user',
        content: [{ type: 'text', text: 'Show me the list of posts' }],
      })
      .catch(() => {
        // Silently handle error
      });
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

  const blogPost = mapPostToBlogPost(post);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <InlineArticleDetail
        post={blogPost}
        showCover={true}
        showAuthor={!!post.author}
        relatedPosts={[]}
        onBack={handleGoBack}
      />
    </div>
  );
}

// Mount the app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostDetailApp />
  </StrictMode>
);
