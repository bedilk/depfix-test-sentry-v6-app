const connect = require("connect");
const Sentry = require("@sentry/node");

const app = connect();

app.use((req, res, next) => {
  res.setHeader("X-Request-Id", Math.random().toString(36).slice(2));
  next();
});

app.use("/status", (req, res) => {
  res.end(JSON.stringify({ connected: true }));
});

Sentry.setupConnectErrorHandler(app);

module.exports = app;
