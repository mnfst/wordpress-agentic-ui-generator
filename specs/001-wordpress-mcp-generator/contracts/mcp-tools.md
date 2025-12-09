# MCP Tools Contract

**Feature**: 001-wordpress-mcp-generator
**Date**: 2025-12-06

This document defines the MCP tools exposed by each generated WordPress MCP server.

## Tool Definitions

### 1. list_posts

Lists all posts from the connected WordPress site with pagination support.

**Tool Metadata**:
```json
{
  "name": "list_posts",
  "description": "List all blog posts from the WordPress site. Returns paginated results with title, excerpt, author, and publication date for each post."
}
```

**Input Schema** (Zod):
```typescript
z.object({
  page: z.number().int().min(1).default(1).describe("Page number for pagination"),
  perPage: z.number().int().min(1).max(100).default(10).describe("Number of posts per page"),
})
```

**Output Schema**:
```typescript
interface ListPostsResult {
  posts: PostListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  ui: McpAppComponent; // ext-apps UI component
}

interface PostListItem {
  id: number;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: string;
  featuredImageUrl: string | null;
  link: string;
}
```

**UI Component**:
The tool returns an ext-apps component that renders a card-based list view:
- Each post displayed as a card with:
  - Featured image thumbnail (if available)
  - Post title (clickable to view detail)
  - Excerpt (first 150 characters)
  - Author name and publication date
- Pagination controls at bottom
- "View Details" action button per card

**Error Cases**:
| Error | Message |
|-------|---------|
| WordPress unreachable | "Unable to connect to WordPress site. Please check the URL and try again." |
| Rate limited | "Too many requests to WordPress. Please wait a moment." |
| Invalid page | "Page number out of range." |

---

### 2. get_post_detail

Retrieves the full content of a specific post.

**Tool Metadata**:
```json
{
  "name": "get_post_detail",
  "description": "Get the full content of a specific blog post including body text, featured image, and metadata."
}
```

**Input Schema** (Zod):
```typescript
z.object({
  postId: z.number().int().positive().describe("The WordPress post ID"),
})
```

**Output Schema**:
```typescript
interface PostDetailResult {
  post: PostDetail;
  ui: McpAppComponent; // ext-apps UI component
}

interface PostDetail {
  id: number;
  title: string;
  content: string;
  authorName: string;
  publishedAt: string;
  modifiedAt: string;
  featuredImageUrl: string | null;
  categories: string[];
  tags: string[];
  link: string;
}
```

**UI Component**:
The tool returns an ext-apps component that renders an article view:
- Featured image (full width, if available)
- Post title (large heading)
- Metadata bar: author, publication date, categories
- Full post content (HTML rendered)
- Tags displayed as chips
- "Back to List" and "View Original" action buttons

**Error Cases**:
| Error | Message |
|-------|---------|
| Post not found | "Post with ID {postId} not found." |
| WordPress unreachable | "Unable to connect to WordPress site. Please check the URL and try again." |
| Post not public | "This post is not publicly accessible." |

---

## MCP Server Configuration

Each MCP server instance is configured with:

**Server Metadata**:
```typescript
{
  name: `wordpress-${serverId}`,
  version: "1.0.0",
  description: `MCP server for ${siteName} (${wordpressUrl})`
}
```

**Transport**: HTTP+SSE (Server-Sent Events)

**Endpoint Pattern**: `/mcp/{serverId}`

---

## ext-apps UI Component Specifications

### Posts List Component

```typescript
// Conceptual structure - actual implementation uses ext-apps SDK
interface PostsListComponent {
  type: 'card-list';
  cards: Array<{
    image?: { src: string; alt: string };
    title: { text: string; action: { type: 'tool_call'; tool: 'get_post_detail'; args: { postId: number } } };
    description: string;
    metadata: Array<{ label: string; value: string }>;
    actions: Array<{ label: string; action: object }>;
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: { type: 'tool_call'; tool: 'list_posts'; args: { page: number } };
  };
}
```

### Post Detail Component

```typescript
// Conceptual structure - actual implementation uses ext-apps SDK
interface PostDetailComponent {
  type: 'article';
  header: {
    image?: { src: string; alt: string };
    title: string;
    metadata: Array<{ label: string; value: string }>;
  };
  content: {
    html: string; // Sanitized HTML content
  };
  footer: {
    tags: string[];
    actions: Array<{
      label: string;
      action: { type: 'tool_call' | 'external_link'; target: string | object };
    }>;
  };
}
```

---

## Usage Examples

### Listing Posts

**User prompt**: "Show me the latest posts from the blog"

**Tool call**:
```json
{
  "name": "list_posts",
  "arguments": {
    "page": 1,
    "perPage": 10
  }
}
```

**Response** (simplified):
```json
{
  "posts": [
    {
      "id": 123,
      "title": "Getting Started with TypeScript",
      "excerpt": "Learn the basics of TypeScript and how to set up your first project...",
      "authorName": "John Doe",
      "publishedAt": "2025-12-01T10:00:00Z",
      "featuredImageUrl": "https://example.com/image.jpg",
      "link": "https://example.wordpress.com/typescript-intro"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPosts": 42,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "ui": { /* ext-apps component */ }
}
```

### Viewing Post Detail

**User prompt**: "Show me the full article"

**Tool call**:
```json
{
  "name": "get_post_detail",
  "arguments": {
    "postId": 123
  }
}
```

**Response** (simplified):
```json
{
  "post": {
    "id": 123,
    "title": "Getting Started with TypeScript",
    "content": "<p>TypeScript is a typed superset of JavaScript...</p>",
    "authorName": "John Doe",
    "publishedAt": "2025-12-01T10:00:00Z",
    "modifiedAt": "2025-12-02T14:30:00Z",
    "featuredImageUrl": "https://example.com/image.jpg",
    "categories": ["Programming", "TypeScript"],
    "tags": ["typescript", "javascript", "tutorial"],
    "link": "https://example.wordpress.com/typescript-intro"
  },
  "ui": { /* ext-apps component */ }
}
```
