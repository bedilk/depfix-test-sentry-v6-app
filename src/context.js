const Sentry = require("@sentry/node");

function withRequestContext(req, fn) {
  const mgr = new Sentry.SentryContextManager();
  return mgr.with(Sentry.getCurrentScope(), fn);
}

function decorateSpan(span, meta) {
  const source = Sentry.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;
  span.setAttribute(source, meta.source || "custom");
  Object.entries(meta).forEach(([k, v]) => {
    if (k !== "source") span.setAttribute(`app.${k}`, v);
  });
}

module.exports = { withRequestContext, decorateSpan };
