# Release notes (draft)

## 3.0.0

### Breaking changes
- Drop ESLint v8 support; ESLint v9 flat config only.
- Remove default export; named exports only (`flatConfig`, `rules`).
- Remove legacy `traditional-config` entrypoint and v8 test suite.

### Changes
- Upgrade ESLint to v9.39.2 and align `@typescript-eslint` + TypeScript tooling.
- Add `tslib` for Rollup TypeScript builds.
- Update v9 RuleTester import to `eslint`.
- Internal typing cleanup and AST helper refactors (behavior unchanged).
