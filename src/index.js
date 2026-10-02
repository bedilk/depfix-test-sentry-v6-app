require("dotenv").config();
const express = require("express");
const Sentry = require("@sentry/node");
const { initSentry, captureError, setUser } = require("./sentry");
const { profileDbQuery, readConfig } = require("./performance");

const app = express();
app.use(express.json());

// Initialize Sentry before any routes
initSentry(app);

app.get("/health", (req, res) => {
  // readConfig uses v10 getConfig API; shows current DSN to ops tooling
  const cfg = readConfig();
  res.json({ status: "ok", sentryDsn: cfg?.dsn });
});

app.get("/config", (req, res) => {
  res.json(readConfig());
});

app.post("/users/:id/action", async (req, res) => {
  const { id } = req.params;
  setUser(id, req.body.email);

  try {
    // profileDbQuery uses v10 startTransaction + addSpanSource internally
    const result = await profileDbQuery("user.action", async () => {
      await new Promise((r) => setTimeout(r, 10));
      return { ok: true };
    });
    res.json(result);
  } catch (err) {
    captureError(err, { userId: id });
    res.status(500).json({ error: "internal error" });
  }
});

// Sentry error handler must be registered after routes
app.use(Sentry.Handlers.errorHandler());

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Listening on :${PORT}`));
