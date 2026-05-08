Add a new API endpoint to the task agent.

The user wants to add a new endpoint. Ask them:
1. What HTTP method? (GET, POST, PATCH, DELETE)
2. What path? (e.g., /tasks/stats)
3. What should it do?

Then:
1. Add the route handler in `src/routes/tasks.js`
2. If it needs a new store function, add it in `src/store/tasks.js`
3. If the AI agent should be able to use it, add a new tool definition in `src/services/agent.js`
4. Add tests for the new endpoint in `tests/tasks.test.js`
5. Run tests to verify everything passes
