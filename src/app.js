const express = require("express");
const taskRoutes = require("./routes/tasks");
const telegramRoutes = require("./routes/telegram");

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({ name: "Task Agent API", version: "1.0.0", endpoints: ["/health", "/tasks", "/tasks/chat"] });
});

// Health check endpoint — Cloud Run uses this to know your service is alive
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount task routes
app.use("/tasks", taskRoutes);

// Mount Telegram webhook
app.use("/webhook", telegramRoutes);

module.exports = app;
