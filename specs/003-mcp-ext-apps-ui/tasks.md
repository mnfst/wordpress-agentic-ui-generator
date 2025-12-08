# Tasks: MCP Ext-Apps UI Integration

**Input**: Design documents from `/specs/003-mcp-ext-apps-ui/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Monorepo**: `packages/backend/`, `packages/mcp-apps/`, `packages/shared/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and mcp-apps package setup

- [x] T001 Create mcp-apps package directory structure: `packages/mcp-apps/src/apps/`, `packages/mcp-apps/src/components/`
- [x] T002 Initialize mcp-apps package.json with React 18.x, @modelcontextprotocol/ext-apps, Vite 5.x, Tailwind CSS 3.x dependencies in `packages/mcp-apps/package.json`
- [x] T003 [P] Configure Vite for multi-entry HTML builds in `packages/mcp-apps/vite.config.ts`
- [x] T004 [P] Configure Tailwind CSS with dark mode class strategy in `packages/mcp-apps/tailwind.config.js`
- [x] T005 [P] Create global CSS entry point with Tailwind directives in `packages/mcp-apps/src/global.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and base infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Define PostListItem type (id, title, excerpt, date, link, featuredImage) in `packages/shared/src/types/wordpress.ts`
- [x] T007 Define PostDetail type (id, title, content, author, date, featuredImage, categories, tags, link) in `packages/shared/src/types/wordpress.ts`
- [x] T008 Define PaginationInfo type (currentPage, totalPages, totalItems, hasNext, hasPrev) in `packages/shared/src/types/wordpress.ts`
- [x] T009 [P] Create base MCP app wrapper component with ext-apps useApp hook in `packages/mcp-apps/src/components/AppWrapper.tsx` *(inlined in app files)*
- [x] T010 [P] Create LoadingState component for loading indicators in `packages/mcp-apps/src/components/LoadingState.tsx` *(inlined in app files)*
- [x] T011 [P] Create ErrorState component for error display in `packages/mcp-apps/src/components/ErrorState.tsx` *(inlined in app files)*

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View List of Items (Priority: P1) MVP

**Goal**: Users can browse a clean, paginated, searchable list of posts in an ext-apps-enabled MCP host

**Independent Test**: Invoke `{slug}_list_posts` tool, verify card-based list UI renders with search bar, pagination controls, and clickable item cards

### Implementation for User Story 1

- [x] T012 [P] [US1] Create PostCard component (title, excerpt, date, thumbnail) in `packages/mcp-apps/src/components/PostCard.tsx` *(inlined in PostsListApp.tsx)*
- [x] T013 [P] [US1] Create SearchBar component with input and submit handler in `packages/mcp-apps/src/components/SearchBar.tsx` *(inlined in PostsListApp.tsx)*
- [x] T014 [P] [US1] Create Pagination component with page controls in `packages/mcp-apps/src/components/Pagination.tsx` *(inlined in PostsListApp.tsx)*
- [x] T015 [P] [US1] Create EmptyState component for "No posts found" message in `packages/mcp-apps/src/components/EmptyState.tsx` *(inlined in PostsListApp.tsx)*
- [x] T016 [US1] Implement PostsListApp React ext-app with useApp hook, ontoolresult handling, search state, pagination state in `packages/mcp-apps/src/apps/PostsListApp.tsx`
- [x] T017 [US1] Create posts-list entry HTML file with app mount point in `packages/mcp-apps/posts-list.html`
- [x] T018 [US1] Add posts-list entry to Vite config multi-entry build in `packages/mcp-apps/vite.config.ts`
- [x] T019 [US1] Implement list_posts tool with ext-apps UI URL and structured data response in `packages/backend/src/mcp-servers/tools/posts-list.tool.ts`
- [x] T020 [US1] Add host messaging for item click to request detail view in `packages/mcp-apps/src/apps/PostsListApp.tsx`

**Checkpoint**: User Story 1 complete - list view is fully functional and testable independently

---

## Phase 4: User Story 2 - View Item Details (Priority: P1)

**Goal**: Users can view full post content with title, author, date, featured image, categories, tags, and formatted body

**Independent Test**: Invoke `{slug}_get_post_detail` tool with valid post ID, verify detail UI renders with all metadata and content

### Implementation for User Story 2

- [x] T021 [P] [US2] Create CategoryBadge component for category/tag display in `packages/mcp-apps/src/components/CategoryBadge.tsx` *(inlined in PostDetailApp.tsx)*
- [x] T022 [P] [US2] Create FeaturedImage component with responsive sizing in `packages/mcp-apps/src/components/FeaturedImage.tsx` *(inlined in PostDetailApp.tsx)*
- [x] T023 [P] [US2] Create PostMeta component (author, date display) in `packages/mcp-apps/src/components/PostMeta.tsx` *(inlined in PostDetailApp.tsx)*
- [x] T024 [P] [US2] Create ExternalLinkButton component for "View Original" action in `packages/mcp-apps/src/components/ExternalLinkButton.tsx` *(inlined in PostDetailApp.tsx)*
- [x] T025 [P] [US2] Create BackButton component for "Back to posts" navigation in `packages/mcp-apps/src/components/BackButton.tsx` *(inlined in PostDetailApp.tsx)*
- [x] T026 [US2] Implement PostDetailApp React ext-app with useApp hook, ontoolresult handling, content rendering in `packages/mcp-apps/src/apps/PostDetailApp.tsx`
- [x] T027 [US2] Create post-detail entry HTML file with app mount point in `packages/mcp-apps/post-detail.html`
- [x] T028 [US2] Add post-detail entry to Vite config multi-entry build in `packages/mcp-apps/vite.config.ts`
- [x] T029 [US2] Implement get_post_detail tool with ext-apps UI URL and structured data response in `packages/backend/src/mcp-servers/tools/post-detail.tool.ts`
- [x] T030 [US2] Add host messaging for external link and back navigation in `packages/mcp-apps/src/apps/PostDetailApp.tsx`

**Checkpoint**: User Stories 1 AND 2 complete - both list and detail views work independently

---

## Phase 5: User Story 3 - Graceful Text Fallback (Priority: P2)

**Goal**: Non-ext-apps hosts receive readable text representations of list and detail data

**Independent Test**: Invoke tools from a non-ext-apps host, verify formatted text output is returned instead of UI

### Implementation for User Story 3

- [x] T031 [P] [US3] Create TextListBuilder class to generate formatted text list output in `packages/backend/src/mcp-ui/components/posts-list.component.ts`
- [x] T032 [P] [US3] Create TextDetailBuilder class to generate formatted text detail output in `packages/backend/src/mcp-ui/components/post-detail.component.ts`
- [x] T033 [US3] Update list_posts tool to include text fallback in response alongside UI data in `packages/backend/src/mcp-servers/tools/posts-list.tool.ts`
- [x] T034 [US3] Update get_post_detail tool to include text fallback in response alongside UI data in `packages/backend/src/mcp-servers/tools/post-detail.tool.ts`

**Checkpoint**: User Story 3 complete - all hosts receive appropriate content format

---

## Phase 6: User Story 4 - Dark Mode Support (Priority: P3)

**Goal**: UI automatically adapts to host/system dark mode preference

**Independent Test**: Toggle system/host dark mode, verify UI colors adapt without reload

### Implementation for User Story 4

- [x] T035 [P] [US4] Add dark mode color variants to all component Tailwind classes in `packages/mcp-apps/src/components/PostCard.tsx` *(inlined with dark: classes)*
- [x] T036 [P] [US4] Add dark mode color variants to SearchBar and Pagination components in `packages/mcp-apps/src/components/SearchBar.tsx`, `packages/mcp-apps/src/components/Pagination.tsx` *(inlined with dark: classes)*
- [x] T037 [P] [US4] Add dark mode color variants to detail components (CategoryBadge, FeaturedImage, PostMeta, ExternalLinkButton, BackButton) in respective component files *(inlined with dark: classes)*
- [x] T038 [US4] Implement dark mode detection and class toggle in AppWrapper based on host/system preference in `packages/mcp-apps/src/components/AppWrapper.tsx` *(via prefers-color-scheme in global.css)*
- [x] T039 [US4] Add dark mode styles to PostsListApp root container in `packages/mcp-apps/src/apps/PostsListApp.tsx`
- [x] T040 [US4] Add dark mode styles to PostDetailApp root container in `packages/mcp-apps/src/apps/PostDetailApp.tsx`

**Checkpoint**: All user stories complete - full dark mode support across all UIs

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge case handling, performance, and final integration

- [x] T041 [P] Add connection error handling state to PostsListApp in `packages/mcp-apps/src/apps/PostsListApp.tsx`
- [x] T042 [P] Add connection error handling state to PostDetailApp in `packages/mcp-apps/src/apps/PostDetailApp.tsx`
- [ ] T043 [P] Add in-flight request handling to prevent race conditions in both apps
- [ ] T044 Update mcp-apps build script in root package.json for workspace build
- [ ] T045 Verify ext-apps bundle serves correctly from backend static file serving
- [ ] T046 Run manual end-to-end test: list -> select item -> view detail -> back to list

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 and can proceed in parallel
  - US3 depends on US1 and US2 tools existing (modifies them)
  - US4 depends on US1 and US2 components existing (adds dark mode)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Depends on US1 and US2 tool implementations (T019, T029)
- **User Story 4 (P3)**: Depends on US1 and US2 component implementations (T012-T016, T021-T026)

### Within Each User Story

- Components before app integration
- App implementation before entry HTML
- Entry HTML before Vite config update
- Frontend before backend tool integration

### Parallel Opportunities

- All Setup tasks T003-T005 marked [P] can run in parallel
- Foundational tasks T009-T011 marked [P] can run in parallel
- US1 components T012-T015 can all run in parallel
- US2 components T021-T025 can all run in parallel
- US3 text builders T031-T032 can run in parallel
- US4 dark mode additions T035-T037 can run in parallel
- US1 and US2 can be developed in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create PostCard component in packages/mcp-apps/src/components/PostCard.tsx"
Task: "Create SearchBar component in packages/mcp-apps/src/components/SearchBar.tsx"
Task: "Create Pagination component in packages/mcp-apps/src/components/Pagination.tsx"
Task: "Create EmptyState component in packages/mcp-apps/src/components/EmptyState.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch all components for User Story 2 together:
Task: "Create CategoryBadge component in packages/mcp-apps/src/components/CategoryBadge.tsx"
Task: "Create FeaturedImage component in packages/mcp-apps/src/components/FeaturedImage.tsx"
Task: "Create PostMeta component in packages/mcp-apps/src/components/PostMeta.tsx"
Task: "Create ExternalLinkButton component in packages/mcp-apps/src/components/ExternalLinkButton.tsx"
Task: "Create BackButton component in packages/mcp-apps/src/components/BackButton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (List View)
4. **STOP and VALIDATE**: Test list view independently
5. Deploy/demo if ready

### Recommended Delivery Order

1. Complete Setup + Foundational -> Foundation ready
2. Add User Story 1 (List) -> Test independently -> Demo (MVP!)
3. Add User Story 2 (Detail) -> Test independently -> Demo (Core complete)
4. Add User Story 3 (Text Fallback) -> Test independently -> Deploy (Universal compatibility)
5. Add User Story 4 (Dark Mode) -> Test independently -> Deploy (Full feature set)
6. Polish phase -> Final release

### Parallel Team Strategy

With two developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (List)
   - Developer B: User Story 2 (Detail)
3. Both stories complete independently
4. Developer A: User Story 3 (Text Fallback - touches both tools)
5. Developer B: User Story 4 (Dark Mode - touches all components)
6. Both: Polish phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- ext-apps UIs are served as static HTML bundles from the backend
