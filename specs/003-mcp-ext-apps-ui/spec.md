# Feature Specification: MCP Ext-Apps UI Integration

**Feature Branch**: `003-mcp-ext-apps-ui`
**Created**: 2025-12-07
**Status**: Draft
**Input**: User description: "each MCP server serves 2 tools: detail and list. Each tool serves a UI using modelcontextprotocol/ext-apps package to display a minimalistic UI using tailwind css and react"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View List of Items (Priority: P1)

As an AI host application user, I want to see a clean, browsable list view when I request a list of items from the MCP server, so that I can easily scan and select items of interest.

**Why this priority**: The list view is the primary entry point for content discovery. Without a functional list UI, users cannot browse available items.

**Independent Test**: Can be fully tested by invoking the `list` tool and verifying a paginated, searchable list UI renders correctly with item cards.

**Acceptance Scenarios**:

1. **Given** an MCP host with ext-apps support, **When** the user invokes the `list_posts` tool, **Then** a minimalistic card-based list UI renders with item titles, excerpts, and dates.
2. **Given** a list UI is displayed, **When** the user enters a search query and submits, **Then** the list filters to show only matching items.
3. **Given** a list UI with multiple pages of results, **When** the user clicks pagination controls, **Then** the list navigates to the requested page and updates the display.
4. **Given** a list item is displayed, **When** the user clicks on the item card, **Then** the host receives a message requesting item details.

---

### User Story 2 - View Item Details (Priority: P1)

As an AI host application user, I want to see a rich, detailed view when I select or request a specific item, so that I can consume the full content with proper formatting.

**Why this priority**: The detail view delivers the core content consumption experience. It's equally critical to the list view for a complete user journey.

**Independent Test**: Can be fully tested by invoking the `get_post_detail` tool with a valid item ID and verifying a full content UI renders with title, metadata, and formatted content.

**Acceptance Scenarios**:

1. **Given** an MCP host with ext-apps support, **When** the user invokes the `get_post_detail` tool with an item ID, **Then** a detail UI renders with title, author, date, featured image, and full content.
2. **Given** a detail UI is displayed, **When** the item has categories or tags, **Then** they display as styled chips/badges.
3. **Given** a detail UI is displayed, **When** the user clicks "View Original" or the external link button, **Then** the host opens the original URL in a browser.
4. **Given** a detail UI is displayed, **When** the user clicks "Back to posts", **Then** the host receives a message to navigate back to the list view.

---

### User Story 3 - Graceful Text Fallback (Priority: P2)

As an AI host application user without ext-apps support, I want to receive a readable text representation of the data, so that I can still access the information in my client.

**Why this priority**: Not all MCP hosts support the ext-apps UI protocol. A text fallback ensures universal compatibility.

**Independent Test**: Can be fully tested by invoking any tool from a non-ext-apps host and verifying formatted text output is returned.

**Acceptance Scenarios**:

1. **Given** an MCP host without ext-apps support, **When** the user invokes the `list_posts` tool, **Then** a formatted text list is returned with item titles, dates, and excerpts.
2. **Given** an MCP host without ext-apps support, **When** the user invokes the `get_post_detail` tool, **Then** formatted text content is returned with full item details.

---

### User Story 4 - Dark Mode Support (Priority: P3)

As an AI host application user with a dark theme preference, I want the UI to automatically adapt to my system/host theme, so that the experience is visually comfortable.

**Why this priority**: Dark mode is an accessibility and comfort feature. The UI should respect user preferences but is not blocking for core functionality.

**Independent Test**: Can be fully tested by toggling system/host dark mode and verifying UI colors adapt appropriately.

**Acceptance Scenarios**:

1. **Given** the host is in dark mode, **When** the list or detail UI renders, **Then** all backgrounds, text, and borders use dark-mode-appropriate colors.
2. **Given** the host switches between light and dark mode, **When** the UI is visible, **Then** the UI updates its color scheme without a full reload.

---

### Edge Cases

- What happens when the list returns zero items? A friendly "No posts found" message displays.
- What happens when an item detail fails to load? An error message displays with the specific error.
- What happens when the MCP host connection drops? A connection error state renders with details.
- What happens when navigating between list and detail rapidly? The UI handles in-flight requests gracefully without race conditions.
- What happens when content contains HTML/scripts? Content is sanitized or rendered safely (dangerouslySetInnerHTML used intentionally for rich content).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each MCP server MUST expose exactly two tools: one for listing items (`list_*`) and one for item details (`get_*_detail`).
- **FR-002**: Each tool MUST return data in a format that can be consumed by the ext-apps UI framework.
- **FR-003**: The list tool UI MUST display items in a card-based layout showing title, excerpt/summary, and date.
- **FR-004**: The list tool UI MUST provide search functionality to filter items.
- **FR-005**: The list tool UI MUST provide pagination when results exceed one page.
- **FR-006**: The detail tool UI MUST display the full content with title, author, date, featured image (if available), and formatted body content.
- **FR-007**: The detail tool UI MUST display categories and tags as visual badges.
- **FR-008**: Both UIs MUST include external link functionality to open the original item URL.
- **FR-009**: Both UIs MUST provide navigation between list and detail views via host messaging.
- **FR-010**: Both UIs MUST support dark mode via CSS class-based theming.
- **FR-011**: Tool responses MUST include both structured data (for UI hosts) and text fallback (for non-UI hosts).
- **FR-012**: UIs MUST display loading states during data fetching operations.
- **FR-013**: UIs MUST display error states when connection or data fetching fails.

### Key Entities

- **List Item**: A summary representation of content with ID, title, excerpt, date, and link.
- **Detail Item**: A full representation of content with ID, title, content body, author info, date, featured image, categories, tags, and link.
- **Pagination Info**: Metadata about the current page, total pages, and navigation availability.
- **MCP App**: A self-contained UI application that connects to the MCP host via the ext-apps protocol.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse a list of items and view any item's details within 3 interactions (invoke list, click item, view detail).
- **SC-002**: List UI loads and renders initial results within 2 seconds under normal network conditions.
- **SC-003**: Detail UI loads and renders full content within 2 seconds under normal network conditions.
- **SC-004**: Search functionality returns filtered results within 2 seconds of submission.
- **SC-005**: 100% of hosts without ext-apps support receive readable text fallback.
- **SC-006**: UI correctly adapts to dark/light mode in 100% of theme-aware hosts.
- **SC-007**: Zero broken visual layouts when viewing content of varying lengths (short titles vs. long titles, minimal vs. extensive content).

## Assumptions

- MCP hosts supporting ext-apps will use the `@modelcontextprotocol/ext-apps` protocol for communication.
- The ext-apps package provides React hooks (`useApp`) for host connection management.
- Tool results are delivered via the `ontoolresult` callback in the app lifecycle.
- Host messaging is available for triggering navigation between views.
- Tailwind CSS utility classes are the standard approach for styling.
- The UI bundle is served as static HTML with embedded JavaScript.
