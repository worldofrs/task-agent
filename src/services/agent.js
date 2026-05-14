const Anthropic = require("@anthropic-ai/sdk").default;
const taskStore = require("../store/tasks");

const client = new Anthropic();

// These are the tools the AI agent can call — this is how "tool use" works.
// You define functions as JSON schemas, send them to Claude, and Claude
// decides which ones to call based on the user's request.
const tools = [
  {
    name: "create_task",
    description: "Create a new task with a title and optional description",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "The task title" },
        description: {
          type: "string",
          description: "Optional task description",
        },
      },
      required: ["title"],
    },
  },
  {
    name: "list_tasks",
    description:
      "List all tasks, optionally filtered by status or priority",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["pending", "in_progress", "done"],
          description: "Filter by status",
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
          description: "Filter by priority",
        },
      },
    },
  },
  {
    name: "update_task",
    description: "Update a task's status, priority, or category",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The task ID" },
        status: {
          type: "string",
          enum: ["pending", "in_progress", "done"],
        },
        priority: {
          type: "string",
          enum: ["low", "medium", "high", "urgent"],
        },
        category: { type: "string", description: "Task category" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_task",
    description: "Delete a task by ID",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "The task ID to delete" },
      },
      required: ["id"],
    },
  },
];

// Execute a tool call from Claude — maps tool names to actual functions
function executeTool(name, input) {
  switch (name) {
    case "create_task":
      return taskStore.createTask(input);
    case "list_tasks": {
      let results = taskStore.getAllTasks();
      if (input.status) {
        results = results.filter((t) => t.status === input.status);
      }
      if (input.priority) {
        results = results.filter((t) => t.priority === input.priority);
      }
      return results;
    }
    case "update_task": {
      const { id, ...updates } = input;
      return taskStore.updateTask(id, updates);
    }
    case "delete_task":
      return { deleted: taskStore.deleteTask(input.id) };
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// The agentic loop: send a message to Claude, and if it wants to use tools,
// execute them and send the results back. Repeat until Claude gives a final
// text response. This is the core pattern for building AI agents.
async function chat(userMessage) {
  const messages = [{ role: "user", content: userMessage }];

  const systemPrompt = `You are a task management assistant. You help users create, organize, and manage their tasks.
When a user asks you to do something with tasks, use the available tools.
When classifying tasks, assign appropriate categories (e.g., "work", "personal", "health", "finance", "learning") and priorities ("low", "medium", "high", "urgent").
Be concise and helpful.`;

  // Agentic loop — keeps running until Claude stops requesting tools
  let response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    tools,
    messages,
  });

  // Keep looping while Claude wants to use tools
  while (response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter(
      (block) => block.type === "tool_use"
    );

    // Execute each tool Claude requested
    const toolResults = toolUseBlocks.map((toolUse) => ({
      type: "tool_result",
      tool_use_id: toolUse.id,
      content: JSON.stringify(executeTool(toolUse.name, toolUse.input)),
    }));

    // Add Claude's response and tool results to the conversation
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });

    // Ask Claude again with the tool results
    response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      tools,
      messages,
    });
  }

  // Extract the final text response
  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "No response generated.";
}

module.exports = { chat };
