require("dotenv").config();
const express = require("express");
const { initSentry, captureError, setUser } = require("./sentry");
const { withTracing } = require("./tracing");
const connectApp = require("./connect-adapter");

const app = express();
app.use(express.json());

initSentry(app);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/users/:id/action", async (req, res) => {
  const { id } = req.params;
  setUser(id, req.body.email);
  try {
    const result = await withTracing("user.action", "db.query", async () => {
      await new Promise((r) => setTimeout(r, 10));
      return { ok: true };
    });
    res.json(result);
  } catch (err) {
    captureError(err, { userId: id });
    res.status(500).json({ error: "internal error" });
  }
});

app.use("/api/connect", connectApp);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Listening on :${PORT}`));
