# Data Model: WordPress MCP Server Generator

**Feature**: 001-wordpress-mcp-generator
**Date**: 2025-12-06

## Entities

### 1. McpServer (Database Entity)

Represents a generated MCP server configuration stored in MySQL.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique server identifier |
| wordpressUrl | string | NOT NULL, UNIQUE | Source WordPress site URL |
| siteName | string | NULL | WordPress site name (fetched from API) |
| status | enum | NOT NULL, default: 'active' | Server status: 'active', 'inactive', 'error' |
| postCount | integer | NULL | Number of posts available |
| createdAt | datetime | NOT NULL, auto | Server creation timestamp |
| updatedAt | datetime | NOT NULL, auto | Last update timestamp |
| lastSyncAt | datetime | NULL | Last successful WordPress sync |
| errorMessage | string | NULL | Last error message if status is 'error' |

**Indexes**:
- Unique index on `wordpressUrl`
- Index on `status` for filtering active servers

**Validation Rules**:
- `wordpressUrl` must be a valid HTTPS URL
- `wordpressUrl` must respond to WordPress REST API probe
- `status` transitions: active ↔ inactive, any → error

---

### 2. WordPressPost (Value Object / API Response)

Represents a post fetched from WordPress REST API. Not persisted in database.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| id | integer | `id` | WordPress post ID |
| title | string | `title.rendered` | Post title (HTML decoded) |
| content | string | `content.rendered` | Full post HTML content |
| excerpt | string | `excerpt.rendered` | Post excerpt (truncated) |
| slug | string | `slug` | URL-friendly post slug |
| status | string | `status` | Post status (publish, draft, etc.) |
| authorId | integer | `author` | Author user ID |
| authorName | string | fetched from `/users/{id}` | Author display name |
| featuredMediaId | integer | `featured_media` | Featured image ID |
| featuredImageUrl | string | fetched from `/media/{id}` | Featured image URL |
| categories | integer[] | `categories` | Category IDs |
| tags | integer[] | `tags` | Tag IDs |
| publishedAt | datetime | `date` | Publication date |
| modifiedAt | datetime | `modified` | Last modification date |
| link | string | `link` | Permalink to original post |

**Transformation Notes**:
- HTML entities in title/excerpt must be decoded
- Featured image requires additional API call to `/media/{id}`
- Author name requires additional API call to `/users/{id}`

---

### 3. PostListItem (DTO)

Simplified post representation for list views.

| Field | Type | Description |
|-------|------|-------------|
| id | integer | WordPress post ID |
| title | string | Post title (plain text) |
| excerpt | string | First 150 characters of excerpt |
| authorName | string | Author display name |
| publishedAt | string | ISO 8601 formatted date |
| featuredImageUrl | string | Featured image thumbnail URL |
| link | string | Permalink to original post |

---

### 4. PostDetail (DTO)

Complete post representation for detail views.

| Field | Type | Description |
|-------|------|-------------|
| id | integer | WordPress post ID |
| title | string | Post title (plain text) |
| content | string | Full HTML content |
| authorName | string | Author display name |
| publishedAt | string | ISO 8601 formatted date |
| modifiedAt | string | ISO 8601 formatted date |
| featuredImageUrl | string | Full-size featured image URL |
| categories | string[] | Category names |
| tags | string[] | Tag names |
| link | string | Permalink to original post |

---

### 5. McpServerInfo (DTO)

Server information returned to frontend.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Server UUID |
| wordpressUrl | string | Source WordPress URL |
| siteName | string | WordPress site name |
| status | string | Current server status |
| postCount | integer | Number of available posts |
| createdAt | string | ISO 8601 creation timestamp |
| connectionEndpoint | string | MCP connection endpoint URL |

---

## Relationships

```
┌─────────────────────┐
│     McpServer       │
│   (persisted DB)    │
└─────────┬───────────┘
          │ fetches via REST API
          ▼
┌─────────────────────┐
│   WordPressPost     │
│ (external API data) │
└─────────┬───────────┘
          │ transforms to
          ▼
┌─────────────────────┐     ┌─────────────────────┐
│   PostListItem      │     │    PostDetail       │
│      (DTO)          │     │       (DTO)         │
└─────────────────────┘     └─────────────────────┘
```

## State Transitions

### McpServer Status

```
                    ┌─────────────────┐
    creation        │                 │
    ──────────────► │     active      │ ◄────────────────┐
                    │                 │                  │
                    └────────┬────────┘                  │
                             │                           │
              user toggles   │   validation              │
              off            │   success                 │
                             ▼                           │
                    ┌─────────────────┐                  │
                    │                 │                  │
                    │    inactive     │──────────────────┘
                    │                 │    user toggles on
                    └────────┬────────┘
                             │
              WordPress      │   any validation
              unreachable    │   or fetch error
                             ▼
                    ┌─────────────────┐
                    │                 │
                    │     error       │
                    │                 │
                    └─────────────────┘
```

## TypeScript Interfaces

```typescript
// packages/shared/src/types/mcp-server.ts

export enum McpServerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
}

export interface McpServerEntity {
  id: string;
  wordpressUrl: string;
  siteName: string | null;
  status: McpServerStatus;
  postCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt: Date | null;
  errorMessage: string | null;
}

export interface McpServerInfo {
  id: string;
  wordpressUrl: string;
  siteName: string | null;
  status: McpServerStatus;
  postCount: number | null;
  createdAt: string;
  connectionEndpoint: string;
}
```

```typescript
// packages/shared/src/types/wordpress.ts

export interface WordPressPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: string;
  authorId: number;
  authorName: string;
  featuredMediaId: number | null;
  featuredImageUrl: string | null;
  categories: number[];
  tags: number[];
  publishedAt: Date;
  modifiedAt: Date;
  link: string;
}

export interface PostListItem {
  id: number;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt: string;
  featuredImageUrl: string | null;
  link: string;
}

export interface PostDetail {
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

## Validation Rules

### McpServer Creation

1. **URL Format**: Must be valid HTTPS URL
2. **WordPress Detection**: `/wp-json/` endpoint must return valid JSON
3. **Posts Access**: `/wp-json/wp/v2/posts?per_page=1` must return 200
4. **Uniqueness**: No existing active server with same URL

### WordPress Post Fetching

1. **Pagination**: Default 10 posts per page, max 100
2. **Content Sanitization**: HTML content preserved but script tags stripped
3. **Image URLs**: Must be absolute URLs, fallback to null if unavailable
4. **Author Resolution**: Cache author names to reduce API calls
