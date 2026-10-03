const Sentry = require("@sentry/node");

const SOURCE_ATTR = Sentry.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;

// Uses old Sentry v7 startTransaction API — replaced by startSpan in v8.
async function withTracing(name, op, fn) {
  const transaction = Sentry.startTransaction({ name, op });
  Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction));
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

// Child span using old API
async function withChildSpan(parent, name, op, fn) {
  const span = parent.startChild({ op, description: name });
  try {
    return await fn(span);
  } finally {
    span.finish();
  }
}

module.exports = { withTracing, withChildSpan, SOURCE_ATTR };
