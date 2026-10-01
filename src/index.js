require("dotenv").config();
const express = require("express");
const { initSentry, captureError, setUser, Handlers } = require("./sentry");

const app = express();

// Sentry v6: must be first middleware
initSentry(app);
app.use(Handlers.requestHandler());
app.use(Handlers.tracingHandler());

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/process", async (req, res) => {
  const { userId, data } = req.body;

  if (userId) setUser({ id: userId, email: `${userId}@example.com` });

  try {
    if (!data) throw new Error("data is required");
    // Simulate processing
    const result = { processed: true, length: String(data).length };
    res.json(result);
  } catch (err) {
    captureError(err, { userId, data });
    res.status(400).json({ error: err.message });
  }
});

// Sentry v6: error handler must be before other error middleware
app.use(Handlers.errorHandler());

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Listening on :${PORT}`));
