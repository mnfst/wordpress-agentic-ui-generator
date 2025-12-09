# Research: WordPress MCP Server Generator

**Feature**: 001-wordpress-mcp-generator
**Date**: 2025-12-06

## Research Topics

### 1. MCP-Nest Integration

**Decision**: Use `@rekog/mcp-nest` for MCP server integration within NestJS.

**Rationale**:
- Native NestJS module with full dependency injection support
- Provides decorators (`@Tool`, `@Resource`, `@Prompt`) for declarative MCP endpoint definition
- Supports Zod schema validation for tool parameters
- Handles MCP protocol implementation automatically
- Supports multiple transports: HTTP+SSE, Streamable HTTP, STDIO

**Key Integration Points**:
1. Import `McpModule.forRoot()` in the root module with server metadata
2. Create injectable tool classes decorated with `@Tool()`
3. Each tool method receives parameters object and `Context` for progress reporting
4. Tools are auto-discovered and exposed as MCP endpoints

**Example Tool Pattern**:
```typescript
@Injectable()
export class PostsListTool {
  @Tool({
    name: 'list_posts',
    description: 'List all posts from the WordPress site',
    parameters: z.object({
      page: z.number().optional(),
      perPage: z.number().optional(),
    }),
  })
  async listPosts(params: { page?: number; perPage?: number }, context: Context) {
    // Implementation
  }
}
```

**Alternatives Considered**:
- Raw `@modelcontextprotocol/sdk`: More flexible but requires manual NestJS integration
- Custom MCP implementation: Unnecessary complexity for PoC

---

### 2. ext-apps UI Components

**Decision**: Use `@modelcontextprotocol/ext-apps` with vanilla JavaScript web components.

**Rationale**:
- Official MCP extension for interactive UI in chat clients
- Provides SDK for both app developers and host developers
- Vanilla JS approach simpler for PoC (React hooks available for future enhancement)
- TypeScript-based with full type support

**Key Integration Points**:
1. Install via git URL (not yet on npm): `npm install -S git+https://github.com/modelcontextprotocol/ext-apps.git`
2. Create UI components that render inside MCP-enabled chat clients
3. Return UI components from MCP tool responses
4. Host SDK available for testing UI rendering

**UI Component Structure**:
- Posts List: Card-based layout with title, excerpt, date, author
- Post Detail: Article view with full content, featured image, metadata

**Alternatives Considered**:
- Custom HTML/CSS strings: Less maintainable, no standard structure
- React-only: Would require React runtime in all host clients

---

### 3. WordPress REST API Integration

**Decision**: Use standard WordPress REST API v2 endpoints with fetch/axios.

**Rationale**:
- WordPress REST API is enabled by default in WordPress 4.7+
- No authentication required for public posts
- Well-documented, stable endpoints
- Standard JSON responses

**Key Endpoints**:
| Endpoint | Description |
|----------|-------------|
| `GET /wp-json/wp/v2/posts` | List posts with pagination |
| `GET /wp-json/wp/v2/posts/{id}` | Get single post detail |
| `GET /wp-json/wp/v2/users/{id}` | Get author details |
| `GET /wp-json/wp/v2/media/{id}` | Get featured image |

**Validation Strategy**:
1. Verify URL format
2. Probe `/wp-json/` endpoint to confirm WordPress REST API availability
3. Test `/wp-json/wp/v2/posts?per_page=1` to verify posts access

**Error Handling**:
- 404 on `/wp-json/`: REST API disabled or not WordPress
- 403 on `/wp-json/wp/v2/posts`: Posts not publicly accessible
- Network errors: Site unreachable

**Alternatives Considered**:
- GraphQL (WPGraphQL plugin): Requires plugin installation, not default
- XML-RPC: Legacy, less suitable for modern apps

---

### 4. Dynamic MCP Server Management

**Decision**: Store server configurations in MySQL; instantiate MCP tool instances dynamically.

**Rationale**:
- Database persistence enables server list retrieval after restart (partial persistence)
- Each WordPress URL maps to a unique MCP server configuration
- NestJS DI allows dynamic service instantiation
- MCP-Nest module can be configured per-server

**Architecture**:
1. User submits WordPress URL → validation → store in DB
2. Create MCP tool instances bound to that WordPress URL
3. Register tools with MCP-Nest module
4. Return server connection info to user

**Server Lifecycle**:
- Created: On URL submission and successful validation
- Active: Running within NestJS process
- Inactive: Stored in DB but not loaded (future: on-demand activation)

**Alternatives Considered**:
- Separate processes per server: Overkill for PoC, complex orchestration
- In-memory only: No persistence, lost on restart

---

### 5. Monorepo Tooling

**Decision**: Use npm workspaces with TypeScript project references.

**Rationale**:
- Native npm feature, no additional tooling required
- TypeScript project references enable incremental builds
- Shared types package prevents duplication
- Simpler than Nx/Turborepo for PoC scope

**Setup**:
```json
// root package.json
{
  "workspaces": ["packages/*"]
}
```

**Alternatives Considered**:
- Nx: Powerful but adds complexity
- Turborepo: Good caching but unnecessary for PoC
- pnpm workspaces: Similar to npm, slight setup overhead

---

### 6. Docker MySQL Setup

**Decision**: Single MySQL 8.x container via Docker Compose.

**Rationale**:
- Consistent development environment
- Easy setup with docker-compose up
- Standard MySQL for TypeORM compatibility
- Volume mount for data persistence

**Configuration**:
```yaml
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: mcp_generator
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
```

**Alternatives Considered**:
- SQLite: Simpler but less production-realistic
- PostgreSQL: Equally good, MySQL specified in requirements

---

## Resolved Clarifications

All technical decisions have been made. No outstanding NEEDS CLARIFICATION items remain.

## Dependencies Summary

| Package | Version | Purpose |
|---------|---------|---------|
| @nestjs/core | ^10.x | Backend framework |
| @nestjs/typeorm | ^10.x | ORM integration |
| typeorm | ^0.3.x | Database ORM |
| mysql2 | ^3.x | MySQL driver |
| @rekog/mcp-nest | latest | MCP-NestJS integration |
| @modelcontextprotocol/sdk | ^3.x | MCP protocol |
| @modelcontextprotocol/ext-apps | git | MCP UI components |
| zod | ^3.x | Schema validation |
| react | ^18.x | Frontend UI |
| tailwindcss | ^3.x | CSS framework |
| vite | ^5.x | Frontend build tool |

## Next Steps

1. Generate data-model.md with entity definitions
2. Create API contracts in OpenAPI format
3. Write quickstart.md with setup instructions
