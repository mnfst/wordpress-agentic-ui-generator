<!--
  Sync Impact Report
  ==================
  Version Change: N/A → 1.0.0 (initial ratification)

  Modified Principles: N/A (initial version)

  Added Sections:
  - Core Principles (5 principles: Readability First, Single Responsibility,
    Open-Closed Design, Dependency Inversion, Self-Documenting Code)
  - Code Quality Standards
  - Development Workflow
  - Governance

  Removed Sections: N/A (initial version)

  Templates Status:
  - .specify/templates/plan-template.md ✅ (Constitution Check section exists, compatible)
  - .specify/templates/spec-template.md ✅ (no constitution-specific references)
  - .specify/templates/tasks-template.md ✅ (no constitution-specific references)
  - .specify/templates/commands/*.md ✅ (no files present, N/A)

  Follow-up TODOs: None
-->

# WordPress Agentic UI Generator Constitution

## Core Principles

### I. Readability First

Code MUST be written primarily for human comprehension. Machine execution is
secondary to human understanding.

**Non-negotiable rules:**
- Variable, function, and class names MUST clearly express intent and purpose
- Functions MUST be short enough to fit on a single screen (~25 lines max)
- Nesting depth MUST NOT exceed 3 levels; refactor into named functions otherwise
- Magic numbers and strings MUST be extracted into named constants
- Complex conditionals MUST be extracted into well-named boolean variables or
  predicate functions

**Rationale:** Code is read 10x more often than it is written. Optimizing for
readability reduces bugs, accelerates onboarding, and enables confident refactoring.

### II. Single Responsibility (SOLID - S)

Every module, class, and function MUST have exactly one reason to change.

**Non-negotiable rules:**
- Each file MUST address a single, well-defined concern
- Functions MUST do one thing; if you use "and" describing it, split it
- Classes MUST encapsulate one concept; extract collaborators into separate classes
- Side effects MUST be isolated and explicit, not hidden within pure logic
- Configuration, orchestration, and business logic MUST live in separate modules

**Rationale:** Single responsibility enables focused testing, safer changes, and
clear ownership. When a component has one job, failures are easier to diagnose
and fixes are less likely to cause regressions.

### III. Open-Closed Design (SOLID - O)

Modules MUST be open for extension but closed for modification.

**Non-negotiable rules:**
- New behavior MUST be added through extension (new classes, composition), not
  by editing existing working code
- Conditional branching on types MUST be replaced with polymorphism or strategy
  patterns when it exceeds 2 cases
- Plugin points and hooks MUST be preferred over hardcoded behavior
- Breaking changes MUST be avoided; deprecate and extend instead

**Rationale:** Extending without modifying preserves stability. Existing tests
remain valid, and new features cannot break proven functionality.

### IV. Dependency Inversion (SOLID - D)

High-level modules MUST NOT depend on low-level modules. Both MUST depend on
abstractions.

**Non-negotiable rules:**
- Business logic MUST NOT import infrastructure directly (databases, APIs,
  file systems)
- Dependencies MUST be injected, not instantiated within consuming code
- Interfaces MUST be defined by the consumer, not the provider (consumer-driven)
- External services MUST be wrapped behind stable internal abstractions
- Constructor injection MUST be preferred over service locators or globals

**Rationale:** Dependency inversion decouples policy from mechanism, enabling
testing with mocks, swapping implementations, and evolving infrastructure
without rewriting business logic.

### V. Self-Documenting Code

Code structure and naming MUST minimize the need for explanatory comments.

**Non-negotiable rules:**
- Comments MUST explain "why," never "what" (the code shows what)
- If a comment is needed to explain logic, the code SHOULD be refactored first
- Public APIs MUST have documentation describing purpose, parameters, return
  values, and exceptions
- README files MUST exist at project and significant module boundaries
- Examples MUST be provided for non-obvious usage patterns

**Rationale:** Comments rot faster than code. Self-documenting code stays
synchronized with behavior, while comments often become misleading over time.

## Code Quality Standards

**Formatting and Style:**
- All code MUST pass automated linting and formatting checks before merge
- Consistent formatting MUST be enforced via automated tools (Prettier, Black, etc.)
- Line length MUST NOT exceed 100 characters

**Testing Requirements:**
- All business logic MUST have unit test coverage
- Public interfaces MUST have integration tests
- Tests MUST be readable and follow the Arrange-Act-Assert pattern
- Test names MUST describe the scenario and expected outcome

**Complexity Limits:**
- Cyclomatic complexity MUST NOT exceed 10 per function
- Files MUST NOT exceed 300 lines; split into modules at natural boundaries
- Function parameter count MUST NOT exceed 4; use objects for grouped parameters

## Development Workflow

**Code Review Requirements:**
- All changes MUST be reviewed by at least one other contributor
- Reviews MUST verify compliance with constitution principles
- Reviewers MUST check for readability, not just correctness
- Self-review against this constitution MUST precede requesting peer review

**Change Process:**
- Each change MUST address a single concern (matches Single Responsibility)
- Commit messages MUST be descriptive and reference related issues
- Breaking changes MUST be documented and communicated before merge
- Refactoring MUST be separate from feature changes (one commit purpose)

**Documentation Updates:**
- API changes MUST include documentation updates in the same PR
- User-facing changes MUST update relevant README or guide files
- Architecture changes MUST be reflected in design documents

## Governance

This constitution supersedes all other development practices and guidelines
within this project. Compliance is mandatory, not advisory.

**Amendment Procedure:**
1. Propose amendment via pull request to this file
2. Document rationale and impact on existing code
3. Obtain approval from project maintainers
4. Update dependent templates and documentation
5. Increment version according to semantic versioning

**Versioning Policy:**
- MAJOR: Removal or incompatible redefinition of principles
- MINOR: New principles added or existing principles materially expanded
- PATCH: Clarifications, typo fixes, non-semantic wording improvements

**Compliance Review:**
- All code reviews MUST include constitution compliance check
- Violations MUST be resolved before merge, or explicitly justified in
  Complexity Tracking (see plan template)
- Automated linting SHOULD enforce measurable constraints where possible

**Version**: 1.0.0 | **Ratified**: 2025-12-06 | **Last Amended**: 2025-12-06
