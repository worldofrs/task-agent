const express = require("express");
const agent = require("../services/agent");

const router = express.Router();

const TELEGRAM_API = "https://api.telegram.org/bot";

// Send a message back to the Telegram user
async function sendMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const res = await fetch(`${TELEGRAM_API}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return res.json();
}

// POST /webhook — Telegram sends updates here
// Every time someone messages your bot, Telegram POSTs the message to this endpoint.
// We extract the text, pass it to the AI agent, and send the reply back.
router.post("/", async (req, res) => {
  const message = req.body?.message;

  if (!message || !message.text) {
    return res.sendStatus(200); // Ignore non-text updates (stickers, photos, etc.)
  }

  const chatId = message.chat.id;
  const userText = message.text;

  // Respond to /start command
  if (userText === "/start") {
    await sendMessage(chatId, "Hi! I'm your Task Agent. Tell me what tasks to create, list, update, or delete. For example:\n\n- Create a task to buy groceries\n- Show all my tasks\n- Mark the groceries task as done");
    return res.sendStatus(200);
  }

  try {
    const reply = await agent.chat(userText);
    await sendMessage(chatId, reply);
  } catch (err) {
    console.error("Telegram agent error:", err);
    await sendMessage(chatId, "Sorry, something went wrong. Please try again.");
  }

  res.sendStatus(200);
});

module.exports = router;
