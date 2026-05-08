const express = require("express");
const taskStore = require("../store/tasks");
const agent = require("../services/agent");

const router = express.Router();

// POST /tasks — Create a new task (direct, no AI)
router.post("/", (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const task = taskStore.createTask({ title, description });
  res.status(201).json(task);
});

// GET /tasks — List all tasks
router.get("/", (req, res) => {
  const tasks = taskStore.getAllTasks();
  res.json(tasks);
});

// GET /tasks/:id — Get a single task
router.get("/:id", (req, res) => {
  const task = taskStore.getTask(req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

// PATCH /tasks/:id — Update a task
router.patch("/:id", (req, res) => {
  const task = taskStore.updateTask(req.params.id, req.body);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
});

// DELETE /tasks/:id — Delete a task
router.delete("/:id", (req, res) => {
  const deleted = taskStore.deleteTask(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.status(204).end();
});

// POST /tasks/chat — Talk to the AI agent
// This is the interesting endpoint: send natural language and the agent
// figures out what to do (create tasks, list them, etc.)
router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }
  try {
    const reply = await agent.chat(message);
    res.json({ reply });
  } catch (err) {
    console.error("Agent error:", err);
    res.status(500).json({ error: "Agent failed to process request" });
  }
});

module.exports = router;
