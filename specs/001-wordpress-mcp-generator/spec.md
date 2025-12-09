# Feature Specification: WordPress MCP Server Generator

**Feature Branch**: `001-wordpress-mcp-generator`
**Created**: 2025-12-06
**Status**: Draft
**Input**: User description: "Build a proof-of-concept that generates MCP servers with UI from a WordPress website URL. Frontend form to paste WordPress URL, generates MCP server serving Posts (list/detail views) with visualization UI for MCP clients."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate MCP Server from WordPress URL (Priority: P1)

A user wants to quickly create an MCP server from their WordPress website. They navigate to the frontend application, paste their WordPress site URL into a form, and submit. The system validates the URL, connects to the WordPress REST API, and generates an MCP server that exposes the site's posts. The user receives confirmation that their server is ready.

**Why this priority**: This is the core value proposition - without MCP server generation, the entire feature has no purpose. Everything else builds on this foundation.

**Independent Test**: Can be fully tested by entering a valid WordPress URL and verifying an MCP server is created and registered in the backend.

**Acceptance Scenarios**:

1. **Given** a user on the frontend form, **When** they paste a valid WordPress URL (e.g., https://example.wordpress.com) and click submit, **Then** the system creates an MCP server and displays a success message with the server identifier.
2. **Given** a user submits an invalid URL, **When** the system attempts to validate it, **Then** the user sees a clear error message explaining the URL is invalid or the site doesn't have WordPress REST API enabled.
3. **Given** a user submits a URL for a site without public posts, **When** the server is generated, **Then** the system creates an empty server and notifies the user that no posts were found.

---

### User Story 2 - Search and View Posts List via MCP Client (Priority: P2)

A user interacting with an MCP client (chat application) wants to search and browse posts from a generated WordPress MCP server. They invoke the posts list tool with optional search query and taxonomy filters (categories, tags), and the MCP server responds with a filtered list of posts including titles, excerpts, and dates. The UI renders this list in a visually appealing card or table format.

**Why this priority**: Viewing and searching the posts list is the primary read operation and demonstrates the core MCP functionality. This is the most common use case after generation.

**Independent Test**: Can be fully tested by generating an MCP server, connecting via an MCP client, and requesting the posts list with various search/filter combinations.

**Acceptance Scenarios**:

1. **Given** a generated MCP server with posts, **When** a user requests the posts list through an MCP client, **Then** they see a formatted list showing post title, excerpt (first 150 characters), publication date, and author for each post.
2. **Given** a WordPress site with more than 10 posts, **When** a user requests the posts list, **Then** the results are paginated with navigation to view additional posts.
3. **Given** a generated MCP server, **When** the posts list UI is rendered, **Then** each post entry is visually distinct and includes a way to view the full post details.
4. **Given** a generated MCP server with posts, **When** a user provides a search query string, **Then** only posts matching the search term in title or content are returned.
5. **Given** a generated MCP server with categorized posts, **When** a user filters by category, **Then** only posts in that category are returned.
6. **Given** a generated MCP server with tagged posts, **When** a user filters by tag, **Then** only posts with that tag are returned.
7. **Given** a user provides both search query and taxonomy filters, **When** the list is requested, **Then** results match all specified criteria (AND across filter types, OR within same taxonomy type).

---

### User Story 3 - View Post Detail via MCP Client (Priority: P3)

A user viewing the posts list wants to read the full content of a specific post. They select a post from the list, and the MCP server returns the complete post content with its full body, metadata (author, date, categories), and any featured image. The UI renders this as a readable article view.

**Why this priority**: Detail view completes the read experience. After seeing the list, users naturally want to drill down into individual posts.

**Independent Test**: Can be fully tested by selecting a specific post from the list and verifying the full content is displayed with proper formatting.

**Acceptance Scenarios**:

1. **Given** a posts list is displayed, **When** a user selects a specific post, **Then** they see the full post content including title, full body text, author, publication date, and categories/tags.
2. **Given** a post has a featured image, **When** the detail view is rendered, **Then** the featured image is displayed prominently.
3. **Given** a user is viewing post details, **When** they want to return to the list, **Then** they can navigate back without losing their place in pagination.

---

### User Story 4 - View Available MCP Servers (Priority: P4)

A backend administrator or user wants to see all MCP servers currently running in the system. They access a server list view that shows all generated servers with their associated WordPress URLs, creation timestamps, and status (active/inactive).

**Why this priority**: This provides operational visibility and management capability, which is important but secondary to the core generation and viewing functionality.

**Independent Test**: Can be fully tested by generating multiple MCP servers and verifying all appear in the server list with correct metadata.

**Acceptance Scenarios**:

1. **Given** multiple MCP servers have been generated, **When** a user accesses the server list, **Then** they see all servers with their WordPress source URL, creation time, and current status.
2. **Given** the server list is displayed, **When** a new server is generated, **Then** the list updates to include the new server.
3. **Given** a server in the list, **When** a user wants to connect to it, **Then** they can obtain the connection information needed for their MCP client.

---

### Edge Cases

- What happens when the WordPress site's REST API is disabled or restricted?
- How does the system handle WordPress sites requiring authentication?
- What happens if the WordPress site becomes unavailable after server generation?
- How does the system handle posts with special characters, HTML content, or embedded media?
- What happens when multiple users try to generate servers for the same WordPress URL?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a WordPress website URL through a frontend form input.
- **FR-002**: System MUST validate that the submitted URL points to a valid WordPress site with REST API access.
- **FR-003**: System MUST generate an MCP server that connects to the WordPress REST API and exposes post resources.
- **FR-004**: The generated MCP server MUST provide a "list posts" capability returning post title, excerpt, date, and author, with support for search via query string and filtering by taxonomies (categories, tags).
- **FR-005**: The generated MCP server MUST provide a "get post detail" capability returning full post content, metadata, and featured image URL.
- **FR-006**: The generated MCP server MUST include UI components (agentic UI) for rendering posts list and detail views.
- **FR-007**: System MUST run generated MCP servers within the backend process.
- **FR-008**: System MUST maintain a registry of all active MCP servers.
- **FR-009**: System MUST provide an interface to view all available/active MCP servers.
- **FR-010**: System MUST handle pagination for WordPress sites with many posts.
- **FR-011**: System MUST provide clear error messages when URL validation or server generation fails.
- **FR-012**: System MUST support standard WordPress REST API endpoints (public, no authentication required for reading public posts).

### Key Entities

- **WordPress Source**: Represents a connected WordPress site; attributes include URL, site name, validation status, and connection timestamp.
- **MCP Server Instance**: A running MCP server generated from a WordPress source; attributes include unique identifier, source WordPress URL, creation timestamp, status (active/inactive), and connection endpoint.
- **Post**: A WordPress blog post exposed through MCP; attributes include ID, title, content, excerpt, author, publication date, categories, tags, and featured image URL.
- **Posts List View**: UI component for displaying multiple posts in a scannable format.
- **Post Detail View**: UI component for displaying a single post's full content.

### Assumptions

- WordPress sites will have the REST API publicly accessible (default WordPress behavior).
- Posts are publicly readable without authentication.
- The system will use the WordPress REST API v2 standard endpoints.
- MCP servers will be ephemeral and tied to the backend process lifecycle.
- This is a proof-of-concept; persistence of server configurations across restarts is not required.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate an MCP server from a WordPress URL in under 30 seconds.
- **SC-002**: Generated MCP servers successfully respond to posts list requests within 2 seconds.
- **SC-003**: Posts list displays correctly with all required fields (title, excerpt, date, author) for 100% of fetched posts.
- **SC-004**: Post detail view renders complete content including any featured images.
- **SC-005**: Server list view accurately reflects all running MCP server instances.
- **SC-006**: System provides actionable error messages for 100% of validation failures (invalid URL, inaccessible site, no REST API).
- **SC-007**: Users can complete the full workflow (generate server, view posts list, view post detail) without technical assistance on first attempt.
- **SC-008**: Search queries return matching posts within 2 seconds.
- **SC-009**: Category and tag filters correctly narrow results to only posts with matching taxonomy terms.

## Clarifications

### Session 2025-12-06

- Q: Should the list tool support search and filtering? → A: Yes, list tool MUST support search via query string and filtering by taxonomies (categories, tags) using WordPress REST API parameters.
- Q: How should multiple taxonomy filters combine? → A: OR within same taxonomy type (e.g., category=tech OR category=news), AND across different filter types (categories, tags, search query).
