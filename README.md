# sentry-express-app

An Express API with Sentry error tracking and performance monitoring.

> **⚠️ Intentionally outdated for depfix testing.**
> This repo uses `@sentry/node@6.19.7` — **two major versions behind** `@sentry/node@8.x`.
> It is a test fixture for [depfix](https://github.com/bedilk/depfix), which should
> detect the 2-major-version drift and generate a PR to bump the dependency.

## What depfix should detect

| Scenario | Expected outcome |
|---|---|
| Version drift | `@sentry/node 6.19.7` → current `8.x` (two major versions) |
| `@sentry/tracing` separate package | ACTIONABLE — removed in v7, now bundled in `@sentry/node` |
| `Tracing.Integrations.Express` | ACTIONABLE — renamed to `Sentry.expressIntegration()` |
| `Sentry.Integrations.Http` | ACTIONABLE — renamed to `Sentry.httpIntegration()` |

## Feed difficulty

**Medium**: Sentry publishes structured migration guides in their GitHub releases and
docs. The v7 and v8 release notes clearly list what changed with code examples.
The 2-major-version gap is the primary depfix signal here — this is a "version drift
first" scenario where the main PR action is a version bump with targeted integration
renames.

## Setup

```bash
cp .env.example .env
npm install
npm start
```
