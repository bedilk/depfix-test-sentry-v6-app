# sentry-express-app

An Express API with Sentry v10 error tracking and performance monitoring.

> **⚠️ Intentionally one major version behind for depfix testing.**
> This repo uses `@sentry/node@10.75.3` — one major version behind `@sentry/node@11.x`.
> It is a test fixture for [depfix](https://github.com/bedilk/depfix).

## What depfix should detect

| Scenario | Expected outcome |
|---|---|
| Version drift | `@sentry/node 10.75.3` → `11.x` (one major step) |
| `new Sentry.ExpressInstrumentation()` | ACTIONABLE — removed in v11 (auto-instrumented) |
| `new Sentry.MongoDBInstrumentation()` | ACTIONABLE — removed in v11 (auto-instrumented) |
| `new Sentry.RedisInstrumentation()` | ACTIONABLE — removed in v11 (auto-instrumented) |
| `Sentry.addSpanSource(span, source)` | ACTIONABLE — removed in v11 |
| `Sentry.getConfig()` | ACTIONABLE — removed in v11 |

## Feed difficulty

**Medium**: depfix already has 477 breaking change records for `@sentry/node@10.75.3 → 11.2.0`
from the TypeScript exports diff. The specific APIs used here are confirmed in those records.

## Setup

```bash
cp .env.example .env
npm install
npm start
```
