jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  expressIntegration: jest.fn(() => ({})),
  inboundFiltersIntegration: jest.fn(() => ({})),
  connectIntegration: jest.fn(() => ({})),
  setupExpressErrorHandler: jest.fn(),
  setupConnectErrorHandler: jest.fn(),
  withScope: jest.fn((cb) => cb({ setExtras: jest.fn() })),
  captureException: jest.fn(),
  setUser: jest.fn(),
  startSpan: jest.fn((opts, cb) => cb({ setStatus: jest.fn(), setAttribute: jest.fn() })),
  getClient: jest.fn(() => ({ getOptions: jest.fn(() => ({ dsn: "https://test@sentry.io/1" })) })),
  getCurrentScope: jest.fn(() => ({ setTag: jest.fn() })),
  SEMANTIC_ATTRIBUTE_SENTRY_SOURCE: "sentry.source",
  SentryContextManager: jest.fn().mockImplementation(() => ({ with: jest.fn((_, fn) => fn()) })),
  isDiagnosticsChannelInjectionEnabled: jest.fn(() => false),
  applyDiagnosticsChannelInjectionIntegrations: jest.fn(),
  diagnosticsChannelInjectionIntegrations: jest.fn(() => []),
  generateInstrumentOnce: jest.fn(() => jest.fn()),
  preloadOpenTelemetry: jest.fn(),
  setNodeAsyncContextStrategy: jest.fn(),
  validateOpenTelemetrySetup: jest.fn(() => true),
}));

const Sentry = require("@sentry/node");
const { initSentry, captureError, setUser } = require("./sentry");

describe("sentry module", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = { use: jest.fn() };
  });

  test("initSentry calls Sentry.init with integrations", () => {
    initSentry(app);
    expect(Sentry.init).toHaveBeenCalledTimes(1);
    const config = Sentry.init.mock.calls[0][0];
    expect(config.tracesSampleRate).toBe(1.0);
    expect(config.integrations).toHaveLength(3);
  });

  test("initSentry sets up express error handler", () => {
    initSentry(app);
    expect(Sentry.setupExpressErrorHandler).toHaveBeenCalledWith(app);
  });

  test("captureError reports to Sentry with scope", () => {
    captureError(new Error("test"), { userId: "123" });
    expect(Sentry.withScope).toHaveBeenCalledTimes(1);
    expect(Sentry.captureException).toHaveBeenCalledTimes(1);
  });

  test("setUser sets user on Sentry", () => {
    setUser("u1", "test@example.com");
    expect(Sentry.setUser).toHaveBeenCalledWith({ id: "u1", email: "test@example.com" });
  });
});

const { withTracing, ensureInstrumentation } = require("./tracing");

describe("tracing module", () => {
  test("withTracing wraps fn in a span", async () => {
    const result = await withTracing("test", "op", async () => 42);
    expect(Sentry.startSpan).toHaveBeenCalled();
    expect(result).toBe(42);
  });

  test("ensureInstrumentation applies diagnostics channel injections", () => {
    ensureInstrumentation();
    expect(Sentry.isDiagnosticsChannelInjectionEnabled).toHaveBeenCalled();
    expect(Sentry.applyDiagnosticsChannelInjectionIntegrations).toHaveBeenCalled();
  });
});

const { bootstrapOtel, registerOnce } = require("./instrumentation");

describe("instrumentation module", () => {
  test("bootstrapOtel preloads and validates OTEL", () => {
    const ok = bootstrapOtel();
    expect(Sentry.preloadOpenTelemetry).toHaveBeenCalled();
    expect(Sentry.setNodeAsyncContextStrategy).toHaveBeenCalled();
    expect(Sentry.validateOpenTelemetrySetup).toHaveBeenCalled();
    expect(ok).toBe(true);
  });

  test("registerOnce uses generateInstrumentOnce", () => {
    registerOnce("test-instr", () => ({}));
    expect(Sentry.generateInstrumentOnce).toHaveBeenCalledWith("test-instr", expect.any(Function));
  });
});

const { withRequestContext, decorateSpan } = require("./context");

describe("context module", () => {
  test("withRequestContext creates a SentryContextManager", () => {
    withRequestContext({}, () => "done");
    expect(Sentry.SentryContextManager).toHaveBeenCalled();
  });

  test("decorateSpan sets source attribute", () => {
    const span = { setAttribute: jest.fn() };
    decorateSpan(span, { source: "route", userId: "u1" });
    expect(span.setAttribute).toHaveBeenCalledWith("sentry.source", "route");
    expect(span.setAttribute).toHaveBeenCalledWith("app.userId", "u1");
  });
});
