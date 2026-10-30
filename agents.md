# Agent Instructions

## Purpose

Make changes that are easy to understand, maintain, and review. Follow the project`s existing conventions before introducing new ones. Keep changes focused on the requested task.

## Before Changes

- Inspect the repository structure and read relevant files before editing.
- Check `readme.md`, `package.json`, configuration, and nearby code to learn the project`s framework, tooling, scripts, and conventions.
- Look for existing components, hooks, utilities, types, and tests that can be reused.
- If repository instructions exist in other `agents.md` files, follow the instructions that apply to the files being changed.
- Do not assume a particular bundler, browser-extension manifest version, styling system, or test framework; use what the project already has.

## Code and Architecture

- Prefer clear, straightforward code over clever abstractions.
- Preserve existing naming, file organization, formatting, import style, and component patterns.
- Keep components focused. Extract shared logic only when it improves clarity or avoids meaningful duplication.
- Use the project`s existing state-management and data-fetching patterns. Avoid adding a dependency for a small, localized need.
- Keep browser APIs and extension-specific behavior behind the project`s existing abstractions where practical.
- Make extension contexts explicit: popup, options page, content script, background/service worker, and shared UI may have different responsibilities and runtime constraints.
- Avoid coupling UI components directly to unrelated extension contexts. Use the project`s established messaging or storage patterns.
- Keep permissions and manifest changes limited to what the feature requires. Explain why a new permission is needed.
- Handle browser API failures and unavailable APIs gracefully where relevant. Do not assume extension storage, messaging, or runtime APIs are always available in every context.
- Avoid unrelated refactors, broad formatting changes, and generated-file edits unless the project requires them.

## React and UI

- Follow the project`s existing component and hook conventions.
- Use semantic HTML and accessible labels, keyboard interactions, and focus behavior.
- Keep UI state close to where it is used unless the project has an established shared-state pattern.
- Include appropriate loading, empty, and error states when a feature can encounter them.
- Preserve existing visual patterns and styling conventions; do not introduce a new design system for a small change.
- Avoid effects for values that can be derived during render. Keep effects focused on synchronizing with external systems.

## Safety and Data Handling

- Validate and handle data received from extension messages, storage, pages, or external sources.
- Do not inject untrusted content as HTML. Prefer safe text rendering and the project`s established sanitization approach.
- Do not add logging of sensitive user data, page contents, credentials, or tokens.
- Do not broaden host access or permissions beyond the feature`s needs.

## Tests and Verification

- Add or update tests for meaningful behavior, following existing test conventions.
- Prefer testing observable behavior over implementation details.
- Run the relevant existing lint, type-check, test, and build scripts when practical. Use scripts defined in `package.json`; do not invent commands.
- If a check cannot be run, say which one and why. Do not claim checks passed unless they did.
- Review the final diff for accidental changes, unused code, and consistency with nearby files.

## Dependencies and Configuration

- Avoid adding dependencies unless they provide clear value and fit the project`s existing stack.
- Do not change tool versions, build configuration, or manifest structure unless required for the task.
- Keep configuration changes minimal and document non-obvious choices in the project`s established way.

## Communication and Handover

- Briefly summarize what changed and any important implementation decisions.
- Report tests and checks that were run, including any that could not be completed.
- Call out new permissions, dependencies, or configuration changes explicitly.
