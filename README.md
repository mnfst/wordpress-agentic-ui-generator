# WordPress Agentic UI Generator

Generate MCP (Model Context Protocol) servers with agentic UI from WordPress websites.

## Architecture

This is a monorepo with three packages:

```
packages/
  ├── backend/    # NestJS API server (port 3000)
  ├── frontend/   # React + Vite UI (port 5173)
  └── shared/     # Shared TypeScript types
```

## Prerequisites

- Node.js >= 18.0.0
- Docker (for MySQL database)

## Getting Started

### 1. Start the Database

```bash
npm run docker:up
```

This starts a MySQL 8.0 container with:
- Database: `mcp_generator`
- User: `mcp_user`
- Password: `mcp_password`
- Port: `3306`

### 2. Configure Environment

```bash
cp packages/backend/.env.example packages/backend/.env
```

The default values work with the Docker database setup.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts **both** frontend and backend concurrently:
- **Frontend**: http://localhost:5173 (Vite dev server with HMR)
- **Backend**: http://localhost:3000 (NestJS with watch mode)

The frontend proxies `/api` requests to the backend automatically.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend + backend in parallel |
| `npm run dev:frontend` | Start only the frontend |
| `npm run dev:backend` | Start only the backend |
| `npm run build` | Build all packages |
| `npm run build:frontend` | Build frontend for production |
| `npm run build:backend` | Build backend for production |
| `npm run start:backend` | Start production backend |
| `npm run test` | Run tests in all packages |
| `npm run lint` | Lint all packages |
| `npm run docker:up` | Start MySQL container |
| `npm run docker:down` | Stop MySQL container |

## API Endpoints

The backend exposes these endpoints:

- `GET /api/health` - Health check
- `GET /api/mcp-servers` - List MCP servers
- `POST /api/mcp-servers` - Create MCP server
- `GET /api/mcp-servers/:id` - Get MCP server details
- `DELETE /api/mcp-servers/:id` - Delete MCP server
- `POST /api/mcp-servers/:id/sync` - Sync WordPress content
- `GET /api/s/:slug/mcp` - MCP endpoint for a specific server
- `POST /api/s/:slug/mcp` - MCP message handler
- `GET /api/sse` - SSE connection for real-time updates
- `POST /api/messages` - Send MCP messages

## Development

### Running Individual Packages

```bash
# Frontend only
npm run dev:frontend

# Backend only (requires database)
npm run dev:backend
```

### Building for Production

```bash
# Build all packages
npm run build

# Build specific package
npm run build:frontend
npm run build:backend
```

## License

ISC
