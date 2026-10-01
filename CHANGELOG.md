# Changelog

## [Unreleased] — Upgrade to @sentry/node@8

This application is pinned to `@sentry/node@6.19.7` — **two major versions behind**
the current `@sentry/node@8.x`. The gap: `v6` → `v7` → `v8`.

### Medium-difficulty migration guide

The following changes are required. This guide is written in a **medium-difficulty**
structured format (table + code blocks) to represent a well-documented SDK migration.

#### 1. Remove @sentry/tracing (merged into @sentry/node in v7)

```diff
- "@sentry/tracing": "6.19.7",
```

`@sentry/tracing` was merged into `@sentry/node` in v7. Remove the separate package.

#### 2. Update Sentry.init integrations

| Before (v6) | After (v8) |
|---|---|
| `new Sentry.Integrations.Http({ tracing: true })` | `Sentry.httpIntegration()` |
| `new Tracing.Integrations.Express({ app })` | `Sentry.expressIntegration({ app })` |

#### 3. Performance tracing handlers (deprecated in v7, removed in v8)

| Before (v6) | After (v8) |
|---|---|
| `app.use(Handlers.tracingHandler())` | Not needed — auto-instrumented |
| `Sentry.startTransaction({ name, op })` | `Sentry.startInactiveSpan({ name, op })` |

#### 4. Version bump in package.json

```diff
- "@sentry/node": "6.19.7",
+ "@sentry/node": "^8.0.0",
```

> **Note**: The core APIs — `Sentry.init()`, `Sentry.captureException()`,
> `Sentry.withScope()`, `Handlers.requestHandler()`, `Handlers.errorHandler()` —
> are stable across all three major versions, so most application code needs
> no changes beyond the package version bump and the integrations update.

## [1.0.0] — 2023-06-01

- Initial release with Sentry v6 error tracking and performance monitoring
