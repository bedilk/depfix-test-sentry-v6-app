# Changelog

## Intentionally pinned to @sentry/node v10.75.3

> **⚠️ For depfix end-to-end testing.**
> This repo uses `@sentry/node@10.75.3` — one major version behind `@sentry/node@11.x`.
> depfix already has 477 breaking change records for this exact version pair
> (10.75.3 → 11.2.0, sourced from the TypeScript exports diff).

### Known v10 → v11 migration notes

| Old (v10) | Removed in v11 | Notes |
|---|---|---|
| `new Sentry.ExpressInstrumentation()` | Removed | Express instrumentation is now automatic via `Sentry.init` auto-detection |
| `new Sentry.MongoDBInstrumentation()` | Removed | MongoDB instrumentation is now automatic |
| `new Sentry.RedisInstrumentation()` | Removed | Redis instrumentation is now automatic |
| `Sentry.addSpanSource(span, source)` | Removed | Replaced by OTel attribute APIs |
| `Sentry.getConfig()` | Removed | Use `Sentry.getClient()?.getOptions()` instead |

### Migration difficulty: medium
Sentry v11 removes explicit instrumentation class exports — they are auto-applied.
The mapping is: remove the explicit constructor calls from the `integrations` array.
depfix can ground this from the 477 TS exports diff records already in its DB.
