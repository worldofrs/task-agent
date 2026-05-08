const request = require("supertest");
const app = require("../src/app");
const taskStore = require("../src/store/tasks");

// Clear the store before each test so tests don't affect each other
beforeEach(() => {
  taskStore.clearAll();
});

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("POST /tasks", () => {
  it("creates a task with title", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Learn Node.js" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Learn Node.js");
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe("pending");
  });

  it("returns 400 if title is missing", async () => {
    const res = await request(app).post("/tasks").send({});
    expect(res.status).toBe(400);
  });
});

describe("GET /tasks", () => {
  it("returns empty array when no tasks", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns all created tasks", async () => {
    await request(app).post("/tasks").send({ title: "Task 1" });
    await request(app).post("/tasks").send({ title: "Task 2" });

    const res = await request(app).get("/tasks");
    expect(res.body).toHaveLength(2);
  });
});

describe("GET /tasks/:id", () => {
  it("returns a specific task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Find me" });

    const res = await request(app).get(`/tasks/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Find me");
  });

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/tasks/nonexistent");
    expect(res.status).toBe(404);
  });
});

describe("PATCH /tasks/:id", () => {
  it("updates a task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Update me" });

    const res = await request(app)
      .patch(`/tasks/${created.body.id}`)
      .send({ status: "done", priority: "high" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
    expect(res.body.priority).toBe("high");
  });
});

describe("DELETE /tasks/:id", () => {
  it("deletes a task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Delete me" });

    const res = await request(app).delete(`/tasks/${created.body.id}`);
    expect(res.status).toBe(204);

    const check = await request(app).get(`/tasks/${created.body.id}`);
    expect(check.status).toBe(404);
  });
});
