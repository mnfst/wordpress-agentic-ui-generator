# Quickstart: WordPress MCP Server Generator

**Feature**: 001-wordpress-mcp-generator
**Date**: 2025-12-06

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- Git

## Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd wordpress-agentic-ui-generator

# Install dependencies (all packages)
npm install
```

### 2. Start Database

```bash
# Start MySQL container
docker compose -f docker/docker-compose.yml up -d

# Verify MySQL is running
docker compose -f docker/docker-compose.yml ps
```

### 3. Configure Environment

```bash
# Copy environment template
cp packages/backend/.env.example packages/backend/.env

# Default values should work for local development:
# DATABASE_HOST=localhost
# DATABASE_PORT=3306
# DATABASE_USER=root
# DATABASE_PASSWORD=root
# DATABASE_NAME=mcp_generator
# PORT=3000
```

### 4. Run Database Migrations

```bash
# Run TypeORM migrations
npm run migration:run --workspace=@wordpress-mcp/backend
```

### 5. Start Development Servers

```bash
# Terminal 1: Start backend
npm run dev --workspace=@wordpress-mcp/backend

# Terminal 2: Start frontend
npm run dev --workspace=@wordpress-mcp/frontend
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api/docs

## Usage

### Generate an MCP Server

1. Open http://localhost:5173 in your browser
2. Paste a WordPress site URL (e.g., `https://wordpress.org/news`)
3. Click "Generate MCP Server"
4. Wait for validation and server creation
5. Copy the MCP connection endpoint

### Connect with an MCP Client

Use the generated connection endpoint with any MCP-compatible client:

```bash
# Example: Using MCP Inspector (if available)
mcp-inspector http://localhost:3000/mcp/<server-id>
```

### Available MCP Tools

Once connected, the MCP server exposes two tools:

1. **list_posts**: List all blog posts with pagination
   ```json
   { "page": 1, "perPage": 10 }
   ```

2. **get_post_detail**: Get full post content
   ```json
   { "postId": 123 }
   ```

## Project Structure

```
wordpress-agentic-ui-generator/
├── packages/
│   ├── shared/           # Shared types
│   ├── backend/          # NestJS API + MCP servers
│   └── frontend/         # React UI
├── docker/               # Docker Compose for MySQL
└── specs/                # Feature specifications
```

## Common Commands

```bash
# Run all tests
npm test

# Run backend tests only
npm test --workspace=@wordpress-mcp/backend

# Lint all packages
npm run lint

# Build all packages
npm run build

# Stop database
docker compose -f docker/docker-compose.yml down
```

## Troubleshooting

### MySQL Connection Failed

```bash
# Check if container is running
docker compose -f docker/docker-compose.yml ps

# View container logs
docker compose -f docker/docker-compose.yml logs mysql

# Restart container
docker compose -f docker/docker-compose.yml restart mysql
```

### WordPress URL Validation Failed

- Ensure the WordPress site has REST API enabled (default in WP 4.7+)
- Check the URL is accessible from your machine
- Verify posts are publicly readable

### Port Already in Use

```bash
# Backend (default 3000)
PORT=3001 npm run dev --workspace=@wordpress-mcp/backend

# Frontend (default 5173)
npm run dev --workspace=@wordpress-mcp/frontend -- --port 5174
```

## Next Steps

After verifying the quickstart works:

1. Review the [API documentation](./contracts/api.openapi.yaml)
2. Check [MCP tools contract](./contracts/mcp-tools.md) for tool specifications
3. Run `/speckit.tasks` to generate implementation tasks
