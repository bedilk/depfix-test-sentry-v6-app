require("dotenv").config();
const Sentry = require("@sentry/node");

function initSentry(app) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
    integrations: [
      Sentry.expressIntegration(),
      Sentry.inboundFiltersIntegration({ allowUrls: [/app\.example\.com/] }),
      Sentry.connectIntegration(),
    ],
  });

  Sentry.setupExpressErrorHandler(app);
}

function captureError(error, context = {}) {
  Sentry.withScope((scope) => {
    scope.setExtras(context);
    Sentry.captureException(error);
  });
}

function setUser(userId, email) {
  Sentry.setUser({ id: userId, email });
}

module.exports = { initSentry, captureError, setUser };
