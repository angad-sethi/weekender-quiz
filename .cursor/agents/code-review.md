# Code Review Checklist

Use this checklist during reviews. Trigger in Cursor chat by typing `/code-review`.

## 1) High-Level Summary
- **Product Impact**: What does this change deliver for users/customers?
- **Engineering Approach**: Key patterns, frameworks, or best practices in use.
- **Scope**: Files, packages, and systems touched. Any migrations or flags?

## 2) Fetch and Scope the Diff
- Ensure local repo is up to date:
```bash
git fetch origin --prune
```
- Check out the target branches and compute the diff:
```bash
# Example
# git checkout feature/my-change
# git rebase origin/main
# git diff --name-status origin/main...HEAD
```
- Focus on files with actual content changes (exclude lockfiles, snapshots unless relevant).

## 3) Quality Gates
- **Build & Typecheck**: Project builds locally; no type errors.
- **Formatting**: oxfmt passes. In this repo: `yarn format:check`
- **Linting**: Lint errors addressed or justified.
- **Tests**: Unit/integration tests updated; flakiness avoided; coverage meaningful. (only run the test files related to the changed files)
- **Comments**: Only include necessary comments, if code is self explaintory remove the comment, remove any comments that were used to explain historical code decisions added during the build.

## 4) Correctness & Maintainability
- **Readability**: Clear names, small functions, minimal nesting, early returns.
- **Separation of Concerns**: Business logic vs UI vs data layer.
- **Error Handling**: Meaningful handling; no swallowed errors; actionable messages.
- **Edge Cases**: Null/undefined, empty states, timeouts, retries, pagination.
- **Config/Env**: No secrets in code; sensible defaults; validation present.

## 5) Performance & Security
- **Performance**: Avoid N+1s, unnecessary re-renders, large payloads; memoization where needed.
- **Security**: Input validation, escaping/encoding, least privilege, SSRF/CSRF/XSS mitigations.
- **Dependencies**: New deps justified; no abandoned/unsafe libs; versions pinned where appropriate.

## 6) API & Data Contracts
- **Contracts**: Types/interfaces aligned across boundaries; breaking changes versioned.
- **Migrations**: Backwards compatibility, rollout plan, data backfills, monitoring.
- **Telemetry**: Logging, metrics, traces added/updated with clear semantics.

## 7) UX & Accessibility (if UI changes)
- **UX**: States for loading/error/empty; responsive; keyboard support.
- **Accessibility**: Labels, roles, contrast, focus management, ARIA as needed.
- **i18n**: Strings externalized; locale-safe formatting for dates/numbers.

## 8) Documentation
- **Code Docs**: Complex logic documented (why, not how). Public APIs documented.
- **Changelog/Release Notes**: User-impacting changes summarized.
- **Runbooks**: Operational notes for deploy/rollbacks if needed.

## 9) Review Outcome
- **Issues Found**: Short list with suggested fixes.
- **Highlights**: Notable strengths or improvements.
- **Action Items**: Next steps before merge.

---

For the agent: You should complete this checklist, making any changes to comply with these requirements
