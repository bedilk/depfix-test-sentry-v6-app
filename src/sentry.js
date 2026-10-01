require("dotenv").config();
const Sentry = require("@sentry/node");

/**
 * Initialize Sentry for an Express + MongoDB + Redis application.
 * Uses v10 instrumentation APIs that were removed or changed in v11.
 */
function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
    // v10: instrumentations are passed directly — changed in v11
    integrations: [
      // ExpressInstrumentation was an exported class in v10; removed in v11
      new Sentry.ExpressInstrumentation(),
      // MongoDBInstrumentation was exported from @sentry/node in v10; removed in v11
      new Sentry.MongoDBInstrumentation(),
      // RedisInstrumentation was exported from @sentry/node in v10; removed in v11
      new Sentry.RedisInstrumentation(),
    ],
  });

  // Express request/error handlers
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

/**
 * Capture and report an error to Sentry.
 */
function captureError(error, context = {}) {
  Sentry.withScope((scope) => {
    scope.setExtras(context);
    Sentry.captureException(error);
  });
}

/**
 * Set the current user on the Sentry scope.
 */
function setUser(userId, email) {
  Sentry.setUser({ id: userId, email });
}

/**
 * Add a custom span source annotation (v10 API; removed in v11).
 * In v11, span sources are handled differently via OTel attributes.
 */
function annotateSpanSource(span, source) {
  // addSpanSource was exported from @sentry/node in v10; removed in v11
  Sentry.addSpanSource(span, source);
}

/**
 * Get the current Sentry configuration (v10 API; removed in v11).
 */
function getCurrentConfig() {
  // getConfig was exported from @sentry/node in v10; removed in v11
  return Sentry.getConfig();
}

module.exports = { initSentry, captureError, setUser, annotateSpanSource, getCurrentConfig };
