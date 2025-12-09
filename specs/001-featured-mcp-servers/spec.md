# Feature Specification: Featured MCP Servers Display

**Feature Branch**: `001-featured-mcp-servers`
**Created**: 2025-12-09
**Status**: Draft
**Input**: User description: "Change landing page to show only featured MCP servers (marked with BOOL column in DB). When user adds a new server, it gets added to DB and a dialog modal shows the URL allowing to copy it."

## Clarifications

### Session 2025-12-09

- Q: When WordPress API validation fails, what error message should users see? → A: Distinguish errors - different messages for "not a WordPress site" vs "REST API is disabled"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Featured MCP Servers on Landing Page (Priority: P1)

A visitor lands on the home page and sees a curated list of "Popular MCP servers" that have been specifically marked as featured by administrators. This ensures the landing page showcases only high-quality, vetted MCP server examples rather than every server ever created.

**Why this priority**: This is the core behavior change - the landing page must filter to show only featured servers. Without this, the feature has no value.

**Independent Test**: Can be fully tested by viewing the landing page and verifying only servers marked as featured in the database appear in the "Popular MCP servers" section.

**Acceptance Scenarios**:

1. **Given** the database contains 10 MCP servers where 3 are marked as featured, **When** a visitor loads the landing page, **Then** only the 3 featured servers appear in the "Popular MCP servers" section
2. **Given** the database contains MCP servers but none are marked as featured, **When** a visitor loads the landing page, **Then** the "Popular MCP servers" section shows an empty state or is hidden
3. **Given** the database has no MCP servers at all, **When** a visitor loads the landing page, **Then** the "Popular MCP servers" section is not displayed

---

### User Story 2 - Create Server and Receive Connection URL in Modal (Priority: P1)

A user wants to add their WordPress site as an MCP server. After submitting the URL form, instead of just seeing a notification, they see a dialog modal that displays the generated MCP connection URL with a clear way to copy it to their clipboard. This ensures users don't miss the critical connection information they need.

**Why this priority**: This is the second core requirement - improving the UX when creating servers so users get immediate access to the connection URL they need.

**Independent Test**: Can be fully tested by adding a new WordPress URL and verifying a modal appears with the connection URL and copy functionality.

**Acceptance Scenarios**:

1. **Given** a user is on the landing page with the URL form, **When** they submit a valid WordPress URL, **Then** a modal dialog appears showing the generated MCP connection URL
2. **Given** the modal is displayed with the connection URL, **When** the user clicks the copy button, **Then** the URL is copied to their clipboard and visual feedback confirms the copy action
3. **Given** the modal is displayed, **When** the user closes the modal (via close button, clicking outside, or pressing Escape), **Then** the modal closes and the form resets

---

### User Story 3 - Server Added to Database Without Featured Flag (Priority: P2)

When a user creates a new MCP server, it should be saved to the database with the featured flag set to false by default. Only administrators can mark servers as featured. This prevents the landing page from being cluttered with every newly created server.

**Why this priority**: This supports the featured servers feature by ensuring new servers don't automatically appear on the landing page.

**Independent Test**: Can be fully tested by creating a new server and verifying it exists in the database with featured=false and does not appear in the landing page's featured section.

**Acceptance Scenarios**:

1. **Given** a user submits a new WordPress URL, **When** the server is successfully created, **Then** the server is saved to the database with the featured attribute set to false
2. **Given** a newly created server with featured=false, **When** the landing page loads, **Then** the new server does not appear in the "Popular MCP servers" section

---

### Edge Cases

- What happens when a server creation fails after the modal is triggered? The modal should show an error state or not appear at all if the creation fails.
- What happens when copying to clipboard fails (older browsers, permissions denied)? A fallback UI should allow manual selection and copying.
- What happens when all featured servers are deleted or unfeatured? The "Popular MCP servers" section should gracefully hide or show an appropriate empty state.
- What happens when the connection URL is very long? The modal should handle long URLs with proper text wrapping or truncation with a way to see the full URL.
- What happens when the WordPress REST API validation fails? System returns 400 error with distinct messages: "This does not appear to be a WordPress site" (404/non-JSON) or "WordPress REST API is not available on this site" (401/403/blocked).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST store a "featured" boolean attribute for each MCP server in the database
- **FR-002**: System MUST set the featured attribute to false by default when creating new MCP servers
- **FR-003**: Landing page MUST only display MCP servers where featured equals true in the "Popular MCP servers" section
- **FR-004**: System MUST display a modal dialog after successful server creation showing the connection URL
- **FR-005**: Modal MUST include a copy-to-clipboard button for the connection URL
- **FR-006**: Modal MUST provide visual feedback when URL is successfully copied
- **FR-007**: Modal MUST be dismissible via close button, clicking outside the modal, or pressing the Escape key
- **FR-008**: System MUST provide feedback when clipboard copy fails, allowing users to manually select the URL
- **FR-009**: When no featured servers exist, the "Popular MCP servers" section MUST either be hidden or show an appropriate empty state
- **FR-010**: System MUST validate that the submitted URL has WordPress REST API available by checking `{URL}/wp-json/wp/v2` endpoint before creating an MCP server
- **FR-011**: System MUST return HTTP 400 error with message "This does not appear to be a WordPress site" when the `/wp-json/wp/v2` endpoint returns 404 or non-JSON response
- **FR-012**: System MUST return HTTP 400 error with message "WordPress REST API is not available on this site" when the endpoint is blocked, returns 401/403, or is otherwise inaccessible

### Key Entities

- **MCP Server**: Extended with a "featured" attribute (boolean) to indicate whether the server should appear on the landing page's popular servers section. Default value is false. Only featured servers are shown in the public listing.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify and copy the MCP connection URL within 10 seconds of creating a new server
- **SC-002**: 100% of newly created servers have featured=false by default
- **SC-003**: Landing page displays only featured servers with zero non-featured servers appearing
- **SC-004**: Users successfully copy the connection URL on first attempt 95% of the time
- **SC-005**: Modal dismissal works via all three methods (close button, outside click, Escape key)

## Assumptions

- Administrators will manually mark servers as featured through a separate admin interface or direct database access (admin UI is out of scope for this feature)
- WordPress REST API validation checks `{URL}/wp-json/wp/v2` endpoint and requires a valid JSON response to proceed
- The modal will follow the existing application styling (Tailwind CSS, warm peachy color scheme)
- Clipboard API is available in target browsers (modern browsers); fallback will be provided for older browsers
