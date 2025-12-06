# Tasks: WordPress MCP Server Generator

**Input**: Design documents from `/specs/001-wordpress-mcp-generator/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo structure**: `packages/shared/`, `packages/backend/`, `packages/frontend/`
- **Docker**: `docker/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [x] T001 Create monorepo structure with npm workspaces in package.json
- [x] T002 Create root tsconfig.base.json with shared TypeScript configuration
- [x] T003 [P] Initialize packages/shared package with package.json
- [x] T004 [P] Initialize packages/backend package with NestJS in packages/backend/package.json
- [x] T005 [P] Initialize packages/frontend package with Vite + React in packages/frontend/package.json
- [x] T006 [P] Configure ESLint and Prettier in root .eslintrc.js and .prettierrc
- [x] T007 Create docker/docker-compose.yml with MySQL 8.x container configuration
- [x] T008 Create docker/mysql/init.sql with database initialization script

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Shared Types

- [x] T009 [P] Create McpServerStatus enum and McpServerEntity interface in packages/shared/src/types/mcp-server.ts
- [x] T010 [P] Create McpServerInfo DTO interface in packages/shared/src/types/mcp-server.ts
- [x] T011 [P] Create WordPressPost, PostListItem, PostDetail interfaces in packages/shared/src/types/wordpress.ts
- [x] T012 [P] Create shared constants (API paths, defaults) in packages/shared/src/constants/index.ts
- [x] T013 Export all types from packages/shared/src/index.ts

### Backend Foundation

- [x] T014 Configure NestJS app module in packages/backend/src/app.module.ts
- [x] T015 Configure TypeORM connection in packages/backend/src/app.module.ts with MySQL
- [x] T016 Create main.ts bootstrap with CORS and validation pipe in packages/backend/src/main.ts
- [x] T017 [P] Create health controller in packages/backend/src/health/health.controller.ts
- [x] T018 Create McpServer entity with TypeORM decorators in packages/backend/src/mcp-servers/entities/mcp-server.entity.ts
- [x] T019 Configure MCP-Nest module integration in packages/backend/src/app.module.ts

### Frontend Foundation

- [x] T020 Configure Vite with React and TypeScript in packages/frontend/vite.config.ts
- [x] T021 Setup Tailwind CSS configuration in packages/frontend/tailwind.config.js
- [x] T022 Create base App component structure in packages/frontend/src/App.tsx
- [x] T023 Create API service base with fetch wrapper in packages/frontend/src/services/api.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate MCP Server from WordPress URL (Priority: P1) 🎯 MVP

**Goal**: Users can submit a WordPress URL and generate an MCP server that exposes posts

**Independent Test**: Enter a valid WordPress URL → MCP server created → success message with server ID displayed

### Backend Implementation for US1

- [x] T024 [P] [US1] Create WordPress module in packages/backend/src/wordpress/wordpress.module.ts
- [x] T025 [P] [US1] Create WordPress types (API response shapes) in packages/backend/src/wordpress/wordpress.types.ts
- [x] T026 [US1] Implement WordPressService with URL validation and REST API probing in packages/backend/src/wordpress/wordpress.service.ts
- [x] T027 [US1] Create MCP servers module in packages/backend/src/mcp-servers/mcp-servers.module.ts
- [x] T028 [US1] Implement McpServersService with create, findAll, findOne methods in packages/backend/src/mcp-servers/mcp-servers.service.ts
- [x] T029 [US1] Create CreateMcpServerDto with validation decorators in packages/backend/src/mcp-servers/dto/create-mcp-server.dto.ts
- [x] T030 [US1] Implement McpServersController with POST /api/mcp-servers endpoint in packages/backend/src/mcp-servers/mcp-servers.controller.ts
- [x] T031 [US1] Add error handling for URL validation failures (400) and duplicates (409) in packages/backend/src/mcp-servers/mcp-servers.controller.ts

### Frontend Implementation for US1

- [x] T032 [P] [US1] Create UrlForm component with input and submit button in packages/frontend/src/components/UrlForm/UrlForm.tsx
- [x] T033 [P] [US1] Create UrlForm styles with Tailwind in packages/frontend/src/components/UrlForm/UrlForm.tsx
- [x] T034 [US1] Add createMcpServer API call in packages/frontend/src/services/api.ts
- [x] T035 [US1] Integrate UrlForm with API in packages/frontend/src/App.tsx
- [x] T036 [US1] Add loading state and error handling UI in packages/frontend/src/components/UrlForm/UrlForm.tsx
- [x] T037 [US1] Add success message display with server ID in packages/frontend/src/App.tsx

**Checkpoint**: User can submit WordPress URL and see success/error response

---

## Phase 4: User Story 2 - Search and View Posts List via MCP Client (Priority: P2)

**Goal**: MCP client can invoke list_posts tool with search/filter params and see formatted posts list with UI

**Independent Test**: Connect MCP client → call list_posts with search query → receive filtered posts with UI component

### Backend Implementation for US2

- [x] T038 [P] [US2] Extend WordPressService with fetchPosts method (pagination, search, categories, tags) in packages/backend/src/wordpress/wordpress.service.ts
- [x] T039 [P] [US2] Create MCP UI module in packages/backend/src/mcp-ui/mcp-ui.module.ts
- [x] T040 [US2] Implement PostsListComponent builder using ext-apps in packages/backend/src/mcp-ui/components/posts-list.component.ts
- [x] T041 [US2] Create list_posts tool with @Tool decorator in packages/backend/src/mcp-servers/tools/posts-list.tool.ts
- [x] T042 [US2] Implement Zod schema for list_posts params (page, perPage, search, categories, tags) in packages/backend/src/mcp-servers/tools/posts-list.tool.ts
- [x] T043 [US2] Implement search and taxonomy filtering logic (OR within type, AND across types) in packages/backend/src/mcp-servers/tools/posts-list.tool.ts
- [x] T044 [US2] Add pagination response with hasNextPage, hasPreviousPage in packages/backend/src/mcp-servers/tools/posts-list.tool.ts
- [x] T045 [US2] Register list_posts tool with MCP-Nest module in packages/backend/src/mcp-servers/mcp-servers.module.ts

**Checkpoint**: MCP client can list and search posts with rendered UI

---

## Phase 5: User Story 3 - View Post Detail via MCP Client (Priority: P3)

**Goal**: MCP client can invoke get_post_detail tool and see full post content with UI

**Independent Test**: Call get_post_detail with post ID → receive full content with featured image and metadata

### Backend Implementation for US3

- [x] T046 [P] [US3] Extend WordPressService with fetchPostById, fetchAuthor, fetchMedia methods in packages/backend/src/wordpress/wordpress.service.ts
- [x] T047 [US3] Implement PostDetailComponent builder using ext-apps in packages/backend/src/mcp-ui/components/post-detail.component.ts
- [x] T048 [US3] Create get_post_detail tool with @Tool decorator in packages/backend/src/mcp-servers/tools/post-detail.tool.ts
- [x] T049 [US3] Implement Zod schema for get_post_detail params (postId) in packages/backend/src/mcp-servers/tools/post-detail.tool.ts
- [x] T050 [US3] Add author name and featured image resolution in packages/backend/src/mcp-servers/tools/post-detail.tool.ts
- [x] T051 [US3] Add category and tag name resolution in packages/backend/src/mcp-servers/tools/post-detail.tool.ts
- [x] T052 [US3] Register get_post_detail tool with MCP-Nest module in packages/backend/src/mcp-servers/mcp-servers.module.ts

**Checkpoint**: MCP client can view full post details with rendered UI

---

## Phase 6: User Story 4 - View Available MCP Servers (Priority: P4)

**Goal**: Users can see all running MCP servers in frontend with connection info

**Independent Test**: Generate multiple servers → view server list → see all servers with status and connection endpoints

### Backend Implementation for US4

- [x] T053 [US4] Add GET /api/mcp-servers endpoint in packages/backend/src/mcp-servers/mcp-servers.controller.ts
- [x] T054 [US4] Add GET /api/mcp-servers/:id endpoint in packages/backend/src/mcp-servers/mcp-servers.controller.ts
- [x] T055 [US4] Add DELETE /api/mcp-servers/:id endpoint in packages/backend/src/mcp-servers/mcp-servers.controller.ts
- [x] T056 [US4] Add POST /api/mcp-servers/:id/sync endpoint in packages/backend/src/mcp-servers/mcp-servers.controller.ts
- [x] T057 [US4] Implement sync logic to refresh WordPress metadata in packages/backend/src/mcp-servers/mcp-servers.service.ts

### Frontend Implementation for US4

- [x] T058 [P] [US4] Create ServerList component with table layout in packages/frontend/src/components/ServerList/ServerList.tsx
- [x] T059 [P] [US4] Create ServerList styles with Tailwind in packages/frontend/src/components/ServerList/ServerList.tsx
- [x] T060 [US4] Add getMcpServers API call in packages/frontend/src/services/api.ts
- [x] T061 [US4] Add deleteMcpServer API call in packages/frontend/src/services/api.ts
- [x] T062 [US4] Integrate ServerList with API and display server data in packages/frontend/src/App.tsx
- [x] T063 [US4] Add connection endpoint copy-to-clipboard functionality in packages/frontend/src/components/ServerList/ServerList.tsx
- [x] T064 [US4] Add status badges (active/inactive/error) in packages/frontend/src/components/ServerList/ServerList.tsx
- [x] T065 [US4] Add auto-refresh when new server created in packages/frontend/src/App.tsx

**Checkpoint**: All user stories complete and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T066 [P] Add README.md for packages/shared with usage instructions
- [x] T067 [P] Add README.md for packages/backend with API documentation
- [x] T068 [P] Add README.md for packages/frontend with setup instructions
- [x] T069 Add error boundary component in packages/frontend/src/components/ErrorBoundary.tsx
- [x] T070 Add loading spinner component in packages/frontend/src/components/LoadingSpinner.tsx
- [x] T071 Validate quickstart.md instructions by running through setup
- [x] T072 Add npm scripts for dev, build, test in root package.json

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP delivery target
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 backend (WordPress service)
- **User Story 3 (Phase 5)**: Depends on Foundational + US1 backend (WordPress service)
- **User Story 4 (Phase 6)**: Depends on Foundational + US1 (needs servers to display)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Foundation only - true MVP, independently testable
- **User Story 2 (P2)**: Shares WordPressService with US1 but adds MCP tool - independently testable via MCP client
- **User Story 3 (P3)**: Shares WordPressService with US1/US2 but adds MCP tool - independently testable via MCP client
- **User Story 4 (P4)**: Uses existing server data - independently testable in frontend

### Parallel Opportunities

**Phase 1 (Setup)**:
```bash
# Run in parallel:
T003: Initialize packages/shared
T004: Initialize packages/backend
T005: Initialize packages/frontend
T006: Configure ESLint/Prettier
```

**Phase 2 (Foundational)**:
```bash
# Run in parallel:
T009: McpServerStatus enum
T010: McpServerInfo DTO
T011: WordPress interfaces
T012: Shared constants
```

**Phase 3 (US1)**:
```bash
# Run in parallel:
T024: WordPress module
T025: WordPress types
T032: UrlForm component
T033: UrlForm styles
```

**Phase 4 (US2)**:
```bash
# Run in parallel:
T038: fetchPosts method
T039: MCP UI module
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T023)
3. Complete Phase 3: User Story 1 (T024-T037)
4. **STOP and VALIDATE**: Submit WordPress URL → see success message
5. Deploy/demo if ready - users can generate MCP servers!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP Release** (generate servers)
3. Add User Story 2 → Test independently → Users can list/search posts via MCP
4. Add User Story 3 → Test independently → Users can view post details via MCP
5. Add User Story 4 → Test independently → Users can manage servers in UI
6. Polish → Production-ready

### Task Counts

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Setup | 8 | 4 |
| Foundational | 15 | 5 |
| US1 | 14 | 4 |
| US2 | 8 | 2 |
| US3 | 7 | 1 |
| US4 | 13 | 2 |
| Polish | 7 | 3 |
| **Total** | **72** | **21** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MCP tools (US2, US3) can be tested with MCP Inspector or any MCP client
