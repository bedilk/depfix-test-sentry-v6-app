const Sentry = require("@sentry/node");

const SOURCE_ATTR = Sentry.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;

async function withTracing(name, op, fn) {
  return Sentry.startSpan({ name, op, attributes: { [SOURCE_ATTR]: "task" } }, async (span) => {
    try {
      return await fn(span);
    } catch (err) {
      span.setStatus({ code: 2, message: err.message });
      throw err;
    }
  });
}

function ensureInstrumentation() {
  if (!Sentry.isDiagnosticsChannelInjectionEnabled()) {
    Sentry.applyDiagnosticsChannelInjectionIntegrations(
      Sentry.diagnosticsChannelInjectionIntegrations()
    );
  }
}

module.exports = { withTracing, ensureInstrumentation, SOURCE_ATTR };
