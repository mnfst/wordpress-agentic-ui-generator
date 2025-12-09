# Research: Featured MCP Servers Display

**Feature Branch**: `001-featured-mcp-servers`
**Date**: 2025-12-09

## Research Tasks

### 1. Database Schema Extension Pattern

**Context**: Need to add a `featured` boolean column to the existing `mcp_servers` table.

**Decision**: Use TypeORM column decorator with default value

**Rationale**:
- Existing codebase uses TypeORM 0.3.x with decorators
- Boolean columns with defaults are straightforward in MySQL
- TypeORM's `synchronize: true` in development handles schema updates automatically
- For production, a migration would be recommended (out of scope for this feature)

**Implementation Pattern**:
```typescript
@Column({ type: 'boolean', default: false })
@Index()  // Index for efficient filtering
featured!: boolean;
```

**Alternatives Considered**:
- Raw SQL migration: More control but adds complexity; TypeORM handles this
- Enum approach (featured/not-featured): Overkill for a simple boolean flag
- Separate junction table: Unnecessary complexity for a single flag

---

### 2. API Query Parameter Pattern for Filtering

**Context**: Need to filter MCP servers by `featured` status in the GET endpoint.

**Decision**: Use optional query parameter `?featured=true`

**Rationale**:
- RESTful convention for filtering collections
- NestJS `@Query()` decorator handles query params cleanly
- Optional parameter maintains backward compatibility (returns all servers if not specified)
- Existing controller uses standard NestJS patterns

**Implementation Pattern**:
```typescript
@Get()
async findAll(@Query('featured') featured?: string): Promise<McpServerInfo[]> {
  const featuredOnly = featured === 'true';
  return this.mcpServersService.findAll(featuredOnly ? { featured: true } : undefined);
}
```

**Alternatives Considered**:
- Separate endpoint `/featured`: Less RESTful, more endpoints to maintain
- POST body filtering: Not appropriate for GET requests
- Header-based filtering: Non-standard, poor discoverability

---

### 3. React Modal Component Pattern

**Context**: Need a modal dialog to display connection URL after server creation.

**Decision**: Create custom modal using Tailwind CSS with portal pattern

**Rationale**:
- No existing modal library in the frontend package
- Tailwind CSS is already used throughout the codebase
- React portal ensures modal renders at document root (proper z-index layering)
- Simple use case doesn't warrant adding a heavy UI library
- Matches existing styling patterns (backdrop blur, rounded corners, peachy colors)

**Implementation Pattern**:
```typescript
// Modal.tsx - Reusable base modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

// Uses createPortal to render at document.body
// Handles: Escape key, backdrop click, focus trap (basic)
```

**Alternatives Considered**:
- Radix UI Dialog: Already have Radix dependency (via mcp-apps), but adds bundle size
- Headless UI: Would need to add dependency
- React Modal: Another dependency to maintain
- Alert/confirm browser dialogs: Poor UX, can't style, no copy functionality

---

### 4. Clipboard API Best Practices

**Context**: Need to copy connection URL to clipboard with fallback for older browsers.

**Decision**: Use Clipboard API with document.execCommand fallback

**Rationale**:
- Clipboard API (`navigator.clipboard.writeText`) is modern and Promise-based
- Supported in all modern browsers (Chrome 66+, Firefox 63+, Safari 13.1+)
- Fallback using hidden textarea + `document.execCommand('copy')` for older browsers
- Existing ServerList.tsx already implements this pattern (line uses inline copy)

**Implementation Pattern**:
```typescript
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
```

**Alternatives Considered**:
- clipboard.js library: Unnecessary dependency for simple use case
- Clipboard API only (no fallback): Would break on some enterprise browsers
- Manual selection only: Poor UX, users have to know to Ctrl+C

---

### 5. Landing Page Data Flow

**Context**: Need to fetch only featured servers for the landing page.

**Decision**: Modify existing `api.getMcpServers()` to accept optional filter parameter

**Rationale**:
- Single API endpoint with optional filtering
- Landing page calls `getMcpServers({ featured: true })`
- Maintains existing data flow through App.tsx → LandingPage
- Minimal changes to existing architecture

**Implementation Pattern**:
```typescript
// api.ts
interface GetMcpServersOptions {
  featured?: boolean;
}

async getMcpServers(options?: GetMcpServersOptions): Promise<McpServerInfo[]> {
  const params = new URLSearchParams();
  if (options?.featured) {
    params.set('featured', 'true');
  }
  const query = params.toString();
  return this.request<McpServerInfo[]>(
    `${API_PATHS.MCP_SERVERS}${query ? `?${query}` : ''}`
  );
}
```

**Alternatives Considered**:
- Separate method `getFeaturedMcpServers()`: Duplicates code, less flexible
- Frontend filtering: Inefficient, fetches unnecessary data
- GraphQL: Overkill for this simple filtering need

---

### 6. Modal State Management

**Context**: Need to show modal after successful server creation.

**Decision**: Local state in UrlForm component with callback to parent

**Rationale**:
- Modal is triggered by form submission success
- Connection URL is available from the API response
- Keep state close to where it's used (Single Responsibility)
- No global state management needed for this isolated interaction

**Implementation Pattern**:
```typescript
// UrlForm.tsx
const [createdServer, setCreatedServer] = useState<McpServerInfo | null>(null);

// After successful creation:
setCreatedServer(server);

// Modal render:
{createdServer && (
  <ConnectionUrlModal
    connectionUrl={createdServer.connectionEndpoint}
    onClose={() => {
      setCreatedServer(null);
      onServerCreated(createdServer); // Notify parent to refresh list
    }}
  />
)}
```

**Alternatives Considered**:
- Context/global state: Overcomplicated for single component interaction
- Modal in App.tsx: Violates colocation principle, harder to reason about
- Browser prompt: Can't style, no copy button, poor UX

---

## Summary

All technical decisions leverage existing patterns in the codebase:
- TypeORM decorators for schema
- NestJS query parameters for API filtering
- Tailwind CSS for modal styling
- Native Clipboard API with fallback
- Local React state for modal management

No additional dependencies required. All NEEDS CLARIFICATION items have been resolved through research of existing codebase patterns.
