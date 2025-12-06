# Implementation Plan: WordPress MCP Server Generator

**Branch**: `001-wordpress-mcp-generator` | **Date**: 2025-12-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-wordpress-mcp-generator/spec.md`

## Summary

Build a proof-of-concept web application that generates MCP servers from WordPress website URLs. Users submit a WordPress URL through a React frontend, which triggers the backend to create an MCP server exposing the site's posts. The MCP server provides two tools (`list` and `detail`) with agentic UI components for rendering posts in MCP clients. The system uses NestJS with MCP-Nest integration, stores server configurations in MySQL, and renders UI using the ext-apps package with web components.

## Technical Context

**Language/Version**: TypeScript 5.x (monorepo with shared types)
**Primary Dependencies**:
- Frontend: React 18, Tailwind CSS, Vite
- Backend: NestJS 10, TypeORM, @rekog/mcp-nest, @modelcontextprotocol/ext-apps
- Database: MySQL 8.x (Docker container)

**Storage**: MySQL via TypeORM (MCP server configurations and metadata)
**Testing**: Jest (unit), Supertest (integration)
**Target Platform**: Web application (Linux server deployment)
**Project Type**: Web application (monorepo: frontend + backend)
**Performance Goals**: MCP server generation in <30s, posts list response <2s
**Constraints**: Proof-of-concept scope, ephemeral servers tied to process lifecycle
**Scale/Scope**: Single-user PoC, ~10 concurrent MCP servers

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation Approach |
|-----------|--------|------------------------|
| I. Readability First | ✅ Pass | TypeScript with clear naming, functions <25 lines, max 3 nesting levels |
| II. Single Responsibility | ✅ Pass | Separate modules: WordPress client, MCP server factory, server registry, UI components |
| III. Open-Closed Design | ✅ Pass | MCP tool interface extensible for future WordPress content types |
| IV. Dependency Inversion | ✅ Pass | NestJS DI for all services; WordPress API wrapped in abstraction |
| V. Self-Documenting Code | ✅ Pass | Clear service/module naming; API contracts in OpenAPI; README per package |

**Code Quality Standards**:
- ESLint + Prettier enforced via pre-commit hooks
- Jest for testing with AAA pattern
- Cyclomatic complexity <10 per function
- Files <300 lines

## Project Structure

### Documentation (this feature)

```text
specs/001-wordpress-mcp-generator/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI specs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
packages/
├── shared/                    # Shared types and utilities
│   ├── src/
│   │   ├── types/            # Shared TypeScript interfaces
│   │   └── constants/        # Shared constants
│   └── package.json
│
├── backend/                   # NestJS application
│   ├── src/
│   │   ├── app.module.ts
│   │   ├── main.ts
│   │   ├── wordpress/        # WordPress API client module
│   │   │   ├── wordpress.module.ts
│   │   │   ├── wordpress.service.ts
│   │   │   └── wordpress.types.ts
│   │   ├── mcp-servers/      # MCP server management module
│   │   │   ├── mcp-servers.module.ts
│   │   │   ├── mcp-servers.controller.ts
│   │   │   ├── mcp-servers.service.ts
│   │   │   ├── entities/
│   │   │   │   └── mcp-server.entity.ts
│   │   │   └── tools/        # MCP tools (list, detail)
│   │   │       ├── posts-list.tool.ts
│   │   │       └── post-detail.tool.ts
│   │   └── mcp-ui/           # Agentic UI components
│   │       ├── mcp-ui.module.ts
│   │       └── components/
│   │           ├── posts-list.component.ts
│   │           └── post-detail.component.ts
│   ├── test/
│   │   ├── unit/
│   │   └── integration/
│   └── package.json
│
└── frontend/                  # React application
    ├── src/
    │   ├── App.tsx
    │   ├── main.tsx
    │   ├── components/
    │   │   ├── UrlForm/
    │   │   │   ├── UrlForm.tsx
    │   │   │   └── UrlForm.test.tsx
    │   │   └── ServerList/
    │   │       ├── ServerList.tsx
    │   │       └── ServerList.test.tsx
    │   ├── services/
    │   │   └── api.ts
    │   └── types/
    ├── test/
    └── package.json

docker/
├── docker-compose.yml        # MySQL container
└── mysql/
    └── init.sql

package.json                   # Root monorepo config (npm workspaces)
tsconfig.base.json            # Shared TypeScript config
```

**Structure Decision**: Web application monorepo pattern selected. Frontend and backend as separate packages with shared types. This enables independent deployment while maintaining type safety across the stack.

## Complexity Tracking

> No constitution violations requiring justification.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Monorepo structure | 3 packages (shared, backend, frontend) | Aligns with constitution; shared types prevent duplication |
| MCP integration | @rekog/mcp-nest | Proven NestJS integration, uses DI pattern |
| UI approach | ext-apps with vanilla JS web components | React hooks available but vanilla JS simpler for PoC |
