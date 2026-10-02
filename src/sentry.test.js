jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  ExpressInstrumentation: jest.fn().mockImplementation(() => ({})),
  MongoDBInstrumentation: jest.fn().mockImplementation(() => ({})),
  RedisInstrumentation: jest.fn().mockImplementation(() => ({})),
  Handlers: {
    requestHandler: jest.fn(() => (req, res, next) => next()),
    tracingHandler: jest.fn(() => (req, res, next) => next()),
    errorHandler: jest.fn(() => (err, req, res, next) => next(err)),
  },
  withScope: jest.fn((cb) => cb({ setExtras: jest.fn() })),
  captureException: jest.fn(),
  setUser: jest.fn(),
  addSpanSource: jest.fn(),
  getConfig: jest.fn(() => ({ dsn: "https://test@sentry.io/1" })),
  // v11 replacements
  getClient: jest.fn(() => ({ getOptions: jest.fn(() => ({ dsn: "https://test@sentry.io/1" })) })),
}));

const Sentry = require("@sentry/node");
const { initSentry, captureError, setUser, annotateSpanSource, getCurrentConfig } = require("./sentry");

describe("sentry module", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = { use: jest.fn() };
  });

  test("initSentry calls Sentry.init", () => {
    initSentry(app);
    expect(Sentry.init).toHaveBeenCalledTimes(1);
    const config = Sentry.init.mock.calls[0][0];
    expect(config.dsn).toBeUndefined(); // DSN comes from env
    expect(config.tracesSampleRate).toBe(1.0);
  });

  test("initSentry registers request and tracing handlers on app", () => {
    initSentry(app);
    expect(app.use).toHaveBeenCalledTimes(2);
    expect(Sentry.Handlers.requestHandler).toHaveBeenCalled();
    expect(Sentry.Handlers.tracingHandler).toHaveBeenCalled();
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

  test("annotateSpanSource annotates span with a source", () => {
    const span = { setAttribute: jest.fn() };
    annotateSpanSource(span, "route");
    // Either old addSpanSource or new setAttribute — both are valid migrations
    const annotated =
      Sentry.addSpanSource.mock.calls.length > 0 ||
      span.setAttribute.mock.calls.length > 0;
    expect(annotated).toBe(true);
  });

  test("getCurrentConfig returns a config object", () => {
    const config = getCurrentConfig();
    expect(config).toBeDefined();
    expect(typeof config).toBe("object");
  });
});
