// In-memory task store
// In a real app, this would be a database (Firestore, PostgreSQL, etc.)
const crypto = require("crypto");

const tasks = new Map();

function createTask({ title, description }) {
  const task = {
    id: crypto.randomUUID(),
    title,
    description: description || "",
    category: null,
    priority: null,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  tasks.set(task.id, task);
  return task;
}

function getTask(id) {
  return tasks.get(id) || null;
}

function getAllTasks() {
  return Array.from(tasks.values());
}

function updateTask(id, updates) {
  const task = tasks.get(id);
  if (!task) return null;
  Object.assign(task, updates);
  return task;
}

function deleteTask(id) {
  return tasks.delete(id);
}

function clearAll() {
  tasks.clear();
}

module.exports = {
  createTask,
  getTask,
  getAllTasks,
  updateTask,
  deleteTask,
  clearAll,
};
