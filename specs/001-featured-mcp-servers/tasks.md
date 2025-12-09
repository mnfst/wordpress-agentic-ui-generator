# Tasks: Featured MCP Servers Display

**Input**: Design documents from `/specs/001-featured-mcp-servers/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app monorepo**: `packages/backend/src/`, `packages/frontend/src/`, `packages/shared/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared type definitions that all user stories depend on

- [x] T001 [P] Add `featured` boolean field to McpServerEntity interface in packages/shared/src/types/mcp-server.ts
- [x] T002 [P] Add `featured` boolean field to McpServerInfo interface in packages/shared/src/types/mcp-server.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema changes that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add `featured` boolean column with default `false` and @Index() decorator to McpServer entity in packages/backend/src/mcp-servers/entities/mcp-server.entity.ts
- [x] T004 Update `toServerInfo()` method to include `featured` field in response in packages/backend/src/mcp-servers/mcp-servers.service.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Featured MCP Servers on Landing Page (Priority: P1) 🎯 MVP

**Goal**: Landing page displays only MCP servers marked as featured in the database

**Independent Test**: View the landing page and verify only servers with `featured=true` appear in the "Popular MCP servers" section. Manually set a server as featured in the database and confirm it appears.

### Implementation for User Story 1

- [x] T005 [US1] Update `findAll()` method in McpServersService to accept optional filter object with `featured` property in packages/backend/src/mcp-servers/mcp-servers.service.ts
- [x] T006 [US1] Add @Query('featured') parameter to findAll controller method in packages/backend/src/mcp-servers/mcp-servers.controller.ts
- [x] T007 [US1] Add optional `featured` filter parameter to `getMcpServers()` method in packages/frontend/src/services/api.ts
- [x] T008 [US1] Update App.tsx to pass `{ featured: true }` to getMcpServers when fetching servers for landing page in packages/frontend/src/App.tsx

**Checkpoint**: Landing page now shows only featured servers. Test by manually marking a server as featured in the database.

---

## Phase 4: User Story 2 - Create Server and Receive Connection URL in Modal (Priority: P1)

**Goal**: After successful server creation, display a modal with the connection URL and copy-to-clipboard functionality

**Independent Test**: Submit a new WordPress URL in the form and verify a modal appears showing the connection URL with a working copy button. Test all three dismissal methods: X button, backdrop click, Escape key.

### Implementation for User Story 2

- [x] T009 [P] [US2] Create reusable Modal component with portal, backdrop click, and Escape key handling in packages/frontend/src/components/Modal/Modal.tsx
- [x] T010 [P] [US2] Create Modal index.ts export file in packages/frontend/src/components/Modal/index.ts
- [x] T011 [US2] Create ConnectionUrlModal component with URL display, copy button, and success feedback in packages/frontend/src/components/ConnectionUrlModal/ConnectionUrlModal.tsx
- [x] T012 [US2] Create ConnectionUrlModal index.ts export file in packages/frontend/src/components/ConnectionUrlModal/index.ts
- [x] T013 [US2] Add `createdServer` state and modal rendering logic to UrlForm component in packages/frontend/src/components/UrlForm/UrlForm.tsx
- [x] T014 [US2] Update UrlForm to show modal on successful creation instead of immediately calling onServerCreated in packages/frontend/src/components/UrlForm/UrlForm.tsx
- [x] T015 [US2] Add clipboard copy utility function with fallback for older browsers in packages/frontend/src/components/ConnectionUrlModal/ConnectionUrlModal.tsx

**Checkpoint**: Creating a new server shows a modal with the connection URL. All three dismiss methods work.

---

## Phase 5: User Story 3 - Server Added to Database Without Featured Flag (Priority: P2)

**Goal**: Ensure new servers are created with `featured=false` by default and don't appear on the landing page

**Independent Test**: Create a new server and verify in the database that `featured=false`. Refresh the landing page and confirm the new server does NOT appear in the "Popular MCP servers" section.

### Implementation for User Story 3

- [x] T016 [US3] Verify entity default value ensures `featured=false` on creation (no code change needed if T003 is correct - validation task only) in packages/backend/src/mcp-servers/entities/mcp-server.entity.ts

**Checkpoint**: New servers always have `featured=false` and never appear in the landing page's featured section.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Handle edge cases and ensure quality

- [x] T017 [P] Update LandingPage to hide "Popular MCP servers" section when no featured servers exist (empty state handling) in packages/frontend/src/components/LandingPage/LandingPage.tsx
- [x] T018 [P] Add visual feedback for clipboard copy failure with fallback to allow manual selection in packages/frontend/src/components/ConnectionUrlModal/ConnectionUrlModal.tsx
- [x] T019 Add proper text wrapping/overflow handling for long connection URLs in modal in packages/frontend/src/components/ConnectionUrlModal/ConnectionUrlModal.tsx
- [x] T020 Run linting and formatting checks: `npm run lint && npm run format:check`
- [x] T021 Verify all acceptance scenarios from spec.md are satisfied (manual verification)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 and User Story 2 can proceed in parallel (different layers)
  - User Story 3 is a verification task, can run after Phase 2
- **Polish (Phase 6)**: Depends on User Stories 1 and 2 being complete
- **WordPress REST API Validation (Phase 7)**: Independent of other phases, enhances US2 validation

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Backend → Frontend flow
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Pure frontend, independent of US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Verification only

### Within Each User Story

- Backend changes before frontend changes (US1)
- Base Modal component before ConnectionUrlModal (US2)
- Core implementation before edge case handling

### Parallel Opportunities

- T001 and T002 can run in parallel (different interfaces in same file)
- T009 and T010 can run in parallel with T011/T012 (different component directories)
- User Story 1 (backend-to-frontend) and User Story 2 (frontend modal) can proceed in parallel
- T017 and T018 can run in parallel (different files)

---

## Parallel Example: User Story 2 (Modal Components)

```bash
# Launch Modal and ConnectionUrlModal component creation in parallel:
Task: "Create reusable Modal component in packages/frontend/src/components/Modal/Modal.tsx"
Task: "Create Modal index.ts export file in packages/frontend/src/components/Modal/index.ts"
# Then:
Task: "Create ConnectionUrlModal component in packages/frontend/src/components/ConnectionUrlModal/ConnectionUrlModal.tsx"
Task: "Create ConnectionUrlModal index.ts export file in packages/frontend/src/components/ConnectionUrlModal/index.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (shared types)
2. Complete Phase 2: Foundational (entity + service)
3. Complete Phase 3: User Story 1 (featured filter)
4. Complete Phase 4: User Story 2 (modal display)
5. **STOP and VALIDATE**: Both P1 stories are complete
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test landing page filtering → Can demo featured servers
3. Add User Story 2 → Test modal → Can demo full creation UX
4. User Story 3 → Verify default behavior (minimal work)
5. Polish → Edge cases and cleanup

### Verification Checklist

After completing all tasks, verify:

- [x] `GET /api/mcp-servers?featured=true` returns only featured servers
- [x] `POST /api/mcp-servers` returns server with `featured: false`
- [x] Landing page shows only featured servers
- [x] Modal appears after successful server creation
- [x] Copy button copies URL to clipboard
- [x] Modal closes via X button, backdrop click, and Escape key
- [x] No featured servers = "Popular MCP servers" section hidden or shows empty state
- [x] Non-WordPress URL returns 400 with "This does not appear to be a WordPress site"
- [x] WordPress with disabled REST API returns 400 with "WordPress REST API is not available on this site"

---

## Phase 7: WordPress REST API Validation Enhancement

**Purpose**: Enhance WordPress URL validation to check the `/wp-json/wp/v2` endpoint and return distinct error messages

**Requirements**: FR-010, FR-011, FR-012 from spec.md

**Independent Test**: Submit invalid URLs (non-WordPress site, WordPress with disabled REST API) and verify appropriate error messages are returned.

### Implementation for WordPress REST API Validation

- [x] T022 [US2] Add `validateRestApi()` method to WordpressService that checks `{URL}/wp-json/wp/v2` endpoint in packages/backend/src/wordpress/wordpress.service.ts
- [x] T023 [US2] Update `getErrorMessage()` method to return distinct error messages based on HTTP status codes (404/non-JSON vs 401/403/blocked) in packages/backend/src/wordpress/wordpress.service.ts
- [x] T024 [US2] Update `validateWordPressUrl()` to call `validateRestApi()` and integrate new error handling in packages/backend/src/wordpress/wordpress.service.ts
- [x] T025 [US2] Verify MCP servers controller/service returns HTTP 400 with appropriate error message when validation fails (already implemented via BadRequestException in mcp-servers.service.ts:62-64)

**Checkpoint**: Invalid URLs return distinct 400 errors: "This does not appear to be a WordPress site" for 404/non-JSON, "WordPress REST API is not available on this site" for 401/403/blocked.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No tests generated (not requested in spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
