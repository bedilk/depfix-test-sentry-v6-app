const Sentry = require("@sentry/node");

const registered = new Set();

function registerOnce(name, factory) {
  const register = Sentry.generateInstrumentOnce(name, factory);
  if (!registered.has(name)) {
    register();
    registered.add(name);
  }
}

function bootstrapOtel() {
  Sentry.preloadOpenTelemetry();
  Sentry.setNodeAsyncContextStrategy();

  const ok = Sentry.validateOpenTelemetrySetup();
  if (!ok) {
    console.warn("OTel validation failed — spans may not propagate");
  }
  return ok;
}

module.exports = { registerOnce, bootstrapOtel };
