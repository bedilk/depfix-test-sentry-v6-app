const Sentry = require("@sentry/node");

/**
 * Performance monitoring helpers using v10 APIs removed in v11.
 *
 * In v11 Sentry moved to OpenTelemetry-native tracing.
 * These wrappers use the v10 transaction/span surface.
 */

/**
 * Wrap an async operation in a Sentry transaction (v10 API).
 * In v11, use `Sentry.startSpan()` instead.
 */
async function withTransaction(name, op, fn) {
  // startTransaction was removed in v11; replaced by startSpan / withActiveSpan
  const transaction = Sentry.startTransaction({ name, op });
  try {
    const result = await fn(transaction);
    transaction.setStatus("ok");
    return result;
  } catch (err) {
    transaction.setStatus("internal_error");
    throw err;
  } finally {
    transaction.finish();
  }
}

/**
 * Annotate the current span with a custom source tag (v10 API).
 * In v11, use span.setAttribute(key, value) directly.
 */
function tagSpanSource(span, source) {
  // addSpanSource exported from @sentry/node in v10; removed in v11
  Sentry.addSpanSource(span, source);
}

/**
 * Read the active Sentry DSN / config at runtime (v10 API).
 * In v11, use Sentry.getClient()?.getOptions() instead.
 */
function readConfig() {
  // getConfig exported from @sentry/node in v10; removed in v11
  return Sentry.getConfig();
}

/**
 * Profile a database query with Sentry tracing (v10 API).
 */
async function profileDbQuery(queryName, queryFn) {
  return withTransaction(`db.${queryName}`, "db.query", async (tx) => {
    const span = tx.startChild({ op: "db", description: queryName });
    tagSpanSource(span, "db");
    try {
      return await queryFn();
    } finally {
      span.finish();
    }
  });
}

module.exports = { withTransaction, tagSpanSource, readConfig, profileDbQuery };
