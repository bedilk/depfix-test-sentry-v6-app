jest.mock("@sentry/node", () => ({
  init: jest.fn(),
  ExpressInstrumentation: jest.fn(),
  MongoDBInstrumentation: jest.fn(),
  RedisInstrumentation: jest.fn(),
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
}));

const Sentry = require("@sentry/node");
const { initSentry, captureError, setUser, annotateSpanSource, getCurrentConfig } = require("./sentry");

describe("sentry module", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = { use: jest.fn() };
  });

  test("initSentry calls Sentry.init with instrumentation classes", () => {
    initSentry(app);
    expect(Sentry.init).toHaveBeenCalledTimes(1);
    const config = Sentry.init.mock.calls[0][0];
    expect(config.integrations).toHaveLength(3);
    expect(Sentry.ExpressInstrumentation).toHaveBeenCalled();
    expect(Sentry.MongoDBInstrumentation).toHaveBeenCalled();
    expect(Sentry.RedisInstrumentation).toHaveBeenCalled();
  });

  test("initSentry registers request and tracing handlers", () => {
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

  test("annotateSpanSource calls addSpanSource", () => {
    const span = {};
    annotateSpanSource(span, "route");
    expect(Sentry.addSpanSource).toHaveBeenCalledWith(span, "route");
  });

  test("getCurrentConfig calls getConfig", () => {
    const config = getCurrentConfig();
    expect(Sentry.getConfig).toHaveBeenCalledTimes(1);
    expect(config).toEqual({ dsn: "https://test@sentry.io/1" });
  });
});
