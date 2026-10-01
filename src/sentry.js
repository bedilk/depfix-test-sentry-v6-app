const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

/**
 * Initialize Sentry with performance tracing.
 * Uses the Sentry v6 API: separate @sentry/tracing package, Integrations namespace.
 */
function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0,
  });
}

/**
 * Capture an exception with optional extra context.
 */
function captureError(error, context = {}) {
  Sentry.withScope((scope) => {
    for (const [key, val] of Object.entries(context)) {
      scope.setExtra(key, val);
    }
    Sentry.captureException(error);
  });
}

/**
 * Set the authenticated user on the current Sentry scope.
 */
function setUser(user) {
  Sentry.setUser({ id: user.id, email: user.email });
}

/**
 * Start a custom transaction for manual performance tracking.
 */
function startTransaction(name, op) {
  return Sentry.startTransaction({ name, op });
}

module.exports = {
  initSentry,
  captureError,
  setUser,
  startTransaction,
  Handlers: Sentry.Handlers,
};
