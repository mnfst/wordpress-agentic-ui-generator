# Implementation Plan: MCP Ext-Apps UI Integration

**Branch**: `003-mcp-ext-apps-ui` | **Date**: 2025-12-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-mcp-ext-apps-ui/spec.md`

## Summary

This feature establishes the pattern for MCP servers to expose two tools (list and detail) with rich interactive UIs using the `@modelcontextprotocol/ext-apps` package. Each tool renders a minimalistic React + Tailwind CSS UI in MCP hosts that support ext-apps, with text fallback for hosts that don't. The existing WordPress MCP implementation already follows this pattern - this plan formalizes and documents the approach.

## Technical Context

**Language/Version**: TypeScript 5.4
**Primary Dependencies**:
- Backend: NestJS 10.x, @rekog/mcp-nest 1.x, @modelcontextprotocol/sdk 1.x, zod 3.x
- Frontend (mcp-apps): React 18.x, @modelcontextprotocol/ext-apps (github:modelcontextprotocol/ext-apps), Vite 5.x, Tailwind CSS 3.x
**Storage**: MySQL via TypeORM (for MCP server metadata, not for UI state)
**Testing**: Jest (backend), manual testing (mcp-apps)
**Target Platform**: Node.js 18+ (backend), modern browsers via MCP host embedding (frontend)
**Project Type**: Monorepo (npm workspaces) with backend, frontend, shared, mcp-apps packages
**Performance Goals**: UI renders within 2 seconds, tool calls complete within 2 seconds
**Constraints**: Must work within MCP ext-apps iframe sandbox, bundle size should be minimal per app
**Scale/Scope**: Each MCP server exposes 2 tools with 2 corresponding UI apps

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Readability First | ✅ Pass | React components are single-purpose, Tailwind utilities are self-documenting |
| II. Single Responsibility | ✅ Pass | Each app file handles one view (list or detail), components are focused |
| III. Open-Closed Design | ✅ Pass | Pattern can be extended to new content types without modifying existing apps |
| IV. Dependency Inversion | ✅ Pass | UI apps receive data via `ontoolresult` callback, not direct service calls |
| V. Self-Documenting Code | ✅ Pass | Component names describe their purpose (PostCard, Pagination, etc.) |
| Complexity Limits | ✅ Pass | Components are <300 lines, functions <25 lines, nesting ≤3 levels |

**Gate Result**: PASS - No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-mcp-ext-apps-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
packages/
├── backend/
│   └── src/
│       ├── mcp-servers/
│       │   └── tools/
│       │       ├── posts-list.tool.ts      # List tool with text fallback
│       │       └── post-detail.tool.ts     # Detail tool with text fallback
│       └── mcp-ui/
│           └── components/
│               ├── posts-list.component.ts  # Text/HTML builder for list
│               └── post-detail.component.ts # Text/HTML builder for detail
├── mcp-apps/
│   ├── src/
│   │   ├── apps/
│   │   │   ├── PostsListApp.tsx           # React ext-app for list view
│   │   │   └── PostDetailApp.tsx          # React ext-app for detail view
│   │   └── global.css                     # Tailwind entry point
│   ├── posts-list.html                    # Entry HTML for list app
│   ├── post-detail.html                   # Entry HTML for detail app
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── shared/
    └── src/
        └── types/
            └── wordpress.ts               # Shared types (PostListItem, PostDetail, etc.)
```

**Structure Decision**: The existing monorepo structure is maintained. The `mcp-apps` package is a separate workspace dedicated to ext-apps UI bundles, built with Vite and served as static HTML files.

## Complexity Tracking

> No constitution violations identified. This section remains empty.
