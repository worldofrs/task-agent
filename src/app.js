const express = require("express");
const taskRoutes = require("./routes/tasks");

const app = express();

// Parse JSON request bodies
app.use(express.json());

// Health check endpoint — Cloud Run uses this to know your service is alive
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Mount task routes
app.use("/tasks", taskRoutes);

module.exports = app;
