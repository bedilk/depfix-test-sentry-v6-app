const Sentry = require("@sentry/node");

// Profile a DB query using old startTransaction API
async function profileDbQuery(label, queryFn) {
  const tx = Sentry.startTransaction({ name: label, op: "db.query" });
  try {
    return await queryFn(tx);
  } catch (err) {
    tx.setStatus("internal_error");
    Sentry.captureException(err);
    throw err;
  } finally {
    tx.finish();
  }
}

// HTTP request tracing with old API
async function traceHttpRequest(url, requestFn) {
  const transaction = Sentry.startTransaction({
    name: `HTTP ${url}`,
    op: "http.client",
    tags: { url },
  });
  const span = transaction.startChild({ op: "http.request", description: url });
  try {
    const result = await requestFn();
    span.setStatus("ok");
    return result;
  } catch (err) {
    span.setStatus("internal_error");
    throw err;
  } finally {
    span.finish();
    transaction.finish();
  }
}

module.exports = { profileDbQuery, traceHttpRequest };
