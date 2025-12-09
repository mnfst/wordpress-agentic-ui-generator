# Implementation Plan: Featured MCP Servers Display

**Branch**: `001-featured-mcp-servers` | **Date**: 2025-12-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-featured-mcp-servers/spec.md`

## Summary

Add a `featured` boolean column to MCP servers to filter the landing page's "Popular MCP servers" section to show only curated servers. Implement a modal dialog that displays the connection URL after successful server creation, with copy-to-clipboard functionality.

## Technical Context

**Language/Version**: TypeScript 5.4+ (monorepo with shared types)
**Primary Dependencies**:
- Backend: NestJS 10.x, TypeORM 0.3.x, MySQL 8.x
- Frontend: React 18.x, Vite 5.x, Tailwind CSS 3.4.x
**Storage**: MySQL via TypeORM (existing `mcp_servers` table)
**Testing**: Jest (backend), Vitest (frontend)
**Target Platform**: Web application (modern browsers)
**Project Type**: Web (monorepo with packages/backend, packages/frontend, packages/shared)
**Performance Goals**: Landing page renders in <1s; modal appears instantly after server creation
**Constraints**: Existing styling conventions (Tailwind, peachy color scheme); no admin UI for this feature
**Scale/Scope**: Single database column addition, one new React component (Modal), modifications to 3-4 existing files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance Status | Notes |
|-----------|------------------|-------|
| **I. Readability First** | PASS | All changes will use clear naming (`featured`, `ConnectionUrlModal`); modal component <25 lines |
| **II. Single Responsibility** | PASS | Modal handles only URL display/copy; entity change is single column addition |
| **III. Open-Closed Design** | PASS | Extending entity with new column; creating new modal component vs modifying existing notification |
| **IV. Dependency Inversion** | PASS | Frontend uses existing API service abstraction; backend uses TypeORM repository pattern |
| **V. Self-Documenting Code** | PASS | Feature uses clear naming; API contract will document the `featured` query parameter |
| **Code Quality Standards** | PASS | Will follow existing linting/formatting; unit tests for new logic |
| **Development Workflow** | PASS | Single concern change; PR will include tests |

**Gate Status**: PASS - No violations identified. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-featured-mcp-servers/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI spec for modified endpoints
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
packages/
├── backend/
│   └── src/
│       └── mcp-servers/
│           ├── entities/
│           │   └── mcp-server.entity.ts    # Add 'featured' column
│           ├── mcp-servers.service.ts      # Update findAll for featured filter
│           └── mcp-servers.controller.ts   # Add query param for featured filter
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Modal/
│       │   │   ├── Modal.tsx               # New reusable modal component
│       │   │   └── index.ts                # Export
│       │   ├── ConnectionUrlModal/
│       │   │   ├── ConnectionUrlModal.tsx  # New connection URL modal
│       │   │   └── index.ts                # Export
│       │   └── UrlForm/
│       │       └── UrlForm.tsx             # Update to show modal on success
│       ├── services/
│       │   └── api.ts                      # Add featured filter param
│       └── App.tsx                         # Update to fetch featured servers only
└── shared/
    └── src/
        └── types/
            └── mcp-server.ts               # Add 'featured' to interfaces
```

**Structure Decision**: Using existing monorepo web application structure. Changes span backend entity/service, frontend components, and shared types.

## Complexity Tracking

> No violations identified - this section is not required.
