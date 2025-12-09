# Quickstart: Featured MCP Servers Display

**Feature Branch**: `001-featured-mcp-servers`
**Date**: 2025-12-09

## Prerequisites

- Node.js 18+
- MySQL 8.x running (via Docker or locally)
- Existing project setup with `npm install` completed

## Development Setup

### 1. Start the Database

```bash
# From repository root
npm run docker:up
```

This starts MySQL via Docker Compose.

### 2. Start Development Servers

```bash
# From repository root - starts backend, frontend, and mcp-apps
npm run dev
```

- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### 3. Database Schema Update

The `featured` column will be automatically added by TypeORM's `synchronize: true` when the backend starts. No manual migration needed for development.

## Testing the Feature

### Backend API

#### List Featured Servers Only

```bash
curl http://localhost:3000/api/mcp-servers?featured=true
```

#### List All Servers

```bash
curl http://localhost:3000/api/mcp-servers
```

#### Create a New Server (always featured=false)

```bash
curl -X POST http://localhost:3000/api/mcp-servers \
  -H "Content-Type: application/json" \
  -d '{"wordpressUrl": "https://wordpress.org/news"}'
```

### Frontend

1. Open http://localhost:5173
2. Submit a WordPress URL in the form
3. Verify the modal appears with the connection URL
4. Click the copy button and verify it works
5. Close the modal and verify the form resets

### Mark a Server as Featured (Manual Database)

For testing, manually mark a server as featured:

```sql
-- Connect to MySQL
mysql -u mcp_user -p mcp_generator

-- Mark a server as featured
UPDATE mcp_servers SET featured = TRUE WHERE slug = 'your-server-slug';

-- Verify
SELECT slug, featured FROM mcp_servers;
```

After marking a server as featured, refresh the landing page to see it in the "Popular MCP servers" section.

## Key Files to Modify

### Backend

| File | Changes |
|------|---------|
| `packages/backend/src/mcp-servers/entities/mcp-server.entity.ts` | Add `featured` column |
| `packages/backend/src/mcp-servers/mcp-servers.service.ts` | Update `findAll()` to support filtering |
| `packages/backend/src/mcp-servers/mcp-servers.controller.ts` | Add `@Query('featured')` parameter |
| `packages/backend/src/mcp-servers/dto/get-mcp-servers.dto.ts` | New DTO for query params (optional) |

### Frontend

| File | Changes |
|------|---------|
| `packages/frontend/src/components/Modal/Modal.tsx` | New reusable modal component |
| `packages/frontend/src/components/ConnectionUrlModal/ConnectionUrlModal.tsx` | New URL modal with copy |
| `packages/frontend/src/components/UrlForm/UrlForm.tsx` | Add modal state and render |
| `packages/frontend/src/components/LandingPage/LandingPage.tsx` | Fetch featured only |
| `packages/frontend/src/services/api.ts` | Add filter parameter |

### Shared

| File | Changes |
|------|---------|
| `packages/shared/src/types/mcp-server.ts` | Add `featured` to interfaces |

## Running Tests

### Backend Tests

```bash
npm run test --workspace=@wordpress-mcp/backend
```

### Frontend Tests

```bash
npm run test --workspace=@wordpress-mcp/frontend
```

## Common Issues

### Issue: Featured column not appearing

**Cause**: TypeORM sync may not have run yet
**Solution**: Restart the backend server

### Issue: Modal not closing on Escape

**Cause**: Missing event listener cleanup
**Solution**: Ensure `useEffect` cleanup function removes the event listener

### Issue: Clipboard copy fails silently

**Cause**: Browser permissions or HTTPS requirement
**Solution**:
- In development, localhost is allowed
- In production, ensure HTTPS
- Check browser console for errors

## Verification Checklist

- [ ] Backend starts without errors
- [ ] `featured` column exists in `mcp_servers` table
- [ ] `GET /api/mcp-servers?featured=true` returns only featured servers
- [ ] `POST /api/mcp-servers` returns server with `featured: false`
- [ ] Landing page shows only featured servers (when some exist)
- [ ] Landing page hides "Popular MCP servers" when no featured servers exist
- [ ] Modal appears after successful server creation
- [ ] Modal displays connection URL correctly
- [ ] Copy button copies URL to clipboard
- [ ] Modal closes via X button, backdrop click, and Escape key
- [ ] Form resets after modal closes
