require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const GAME_WEBHOOK_URL = process.env.N8N_GAME_WEBHOOK_URL;
const FINANCE_WEBHOOK_URL = process.env.N8N_FINANCE_WEBHOOK_URL;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) {
    return;
  }

  const content = message.content.trim();

  if (!content.startsWith("!")) {
    return;
  }

  console.log(`Received: ${content}`);

  // Get command
  const command = content
    .slice(1)
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();

  // Finance commands
  const financeCommands = [
    "market",
    "stock",
    "compare",
    "beststock",
    "gold",
    "usd",
    "news",
    "help"
  ];

  let webhookUrl;

  if (financeCommands.includes(command)) {
    webhookUrl = FINANCE_WEBHOOK_URL;
  } else {
    // Everything else continues to existing game-search workflow
    webhookUrl = GAME_WEBHOOK_URL;
  }

  if (!webhookUrl) {
    console.error(`No webhook configured for command: ${command}`);
    return;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: content,
        channel_id: message.channel.id,
        author: message.author.username
      })
    });

    console.log(
      `Sent ${content} to ${command} webhook: ${response.status}`
    );

  } catch (error) {
    console.error("Failed to send to n8n:", error);
  }
});

client.login(BOT_TOKEN);