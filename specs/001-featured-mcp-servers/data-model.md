# Data Model: Featured MCP Servers Display

**Feature Branch**: `001-featured-mcp-servers`
**Date**: 2025-12-09

## Entity Changes

### MCP Server Entity

**Existing Entity**: `packages/backend/src/mcp-servers/entities/mcp-server.entity.ts`

#### New Field

| Field | Type | Default | Nullable | Indexed | Description |
|-------|------|---------|----------|---------|-------------|
| `featured` | boolean | `false` | No | Yes | Indicates if the server should appear in the landing page's "Popular MCP servers" section |

#### Updated Entity Definition

```typescript
@Entity('mcp_servers')
export class McpServer {
  // ... existing fields ...

  @Column({ type: 'boolean', default: false })
  @Index()
  featured!: boolean;
}
```

#### Database Schema Change

**Table**: `mcp_servers`

**New Column**:
```sql
ALTER TABLE mcp_servers
ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_mcp_servers_featured ON mcp_servers(featured);
```

Note: TypeORM with `synchronize: true` will handle this automatically in development. For production, a migration should be created.

---

## Shared Types Updates

**File**: `packages/shared/src/types/mcp-server.ts`

### McpServerEntity Interface

```typescript
export interface McpServerEntity {
  id: string;
  slug: string;
  wordpressUrl: string;
  siteName: string | null;
  status: McpServerStatus;
  postCount: number | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncAt: Date | null;
  errorMessage: string | null;
  featured: boolean;  // NEW
}
```

### McpServerInfo Interface (API Response DTO)

```typescript
export interface McpServerInfo {
  id: string;
  slug: string;
  wordpressUrl: string;
  siteName: string | null;
  status: McpServerStatus;
  postCount: number | null;
  createdAt: string;
  connectionEndpoint: string;
  featured: boolean;  // NEW
}
```

---

## Validation Rules

### Featured Field

- **Type**: Boolean
- **Default**: `false` - All new servers start as non-featured
- **Mutation**: Only via direct database access or admin API (out of scope for this feature)
- **Query**: Filterable via API query parameter

### Business Rules

1. **New Server Creation**: `featured` is always set to `false` by default
2. **Server Listing**: When `?featured=true` query param is present, only return servers where `featured = true`
3. **Landing Page**: Always requests featured servers only
4. **No Cascade**: Deleting a server simply removes it; no special handling for featured status

---

## State Transitions

The `featured` field has no complex state machine - it's a simple boolean toggle:

```
┌─────────────┐         Admin Action         ┌─────────────┐
│  featured   │◄──────────────────────────►│  featured   │
│   = false   │                             │   = true    │
└─────────────┘                             └─────────────┘
       │                                           │
       │ (default for new servers)                 │ (appears on landing page)
       ▼                                           ▼
   Not shown in                              Shown in
   "Popular MCP servers"                     "Popular MCP servers"
```

---

## Index Strategy

### New Index

| Index Name | Column(s) | Purpose |
|------------|-----------|---------|
| `idx_mcp_servers_featured` | `featured` | Efficient filtering for landing page query |

### Query Patterns Supported

1. **Get all featured servers** (landing page):
   ```sql
   SELECT * FROM mcp_servers WHERE featured = TRUE ORDER BY created_at DESC;
   ```

2. **Get all servers** (admin view, if added later):
   ```sql
   SELECT * FROM mcp_servers ORDER BY created_at DESC;
   ```

---

## Migration Considerations

### Development (TypeORM Synchronize)

TypeORM's `synchronize: true` will automatically:
1. Add the `featured` column with default `false`
2. Create the index

### Production Migration (Future)

When deploying to production:
1. Create a migration file using TypeORM CLI
2. Run migration before deploying new code
3. All existing servers will have `featured = false` by default

```bash
# Generate migration
npx typeorm migration:generate -n AddFeaturedColumn

# Run migration
npx typeorm migration:run
```
