require("dotenv").config();

const { Client, GatewayIntentBits } = require("discord.js");

// ======================================================
// ENVIRONMENT VARIABLES
// ======================================================

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const OLD_GAME_WEBHOOK_URL = process.env.N8N_OLD_GAME_WEBHOOK_URL;
const NEW_GAME_WEBHOOK_URL = process.env.N8N_NEW_GAME_WEBHOOK_URL;
const FINANCE_WEBHOOK_URL = process.env.N8N_FINANCE_WEBHOOK_URL;


// ======================================================
// DISCORD CLIENT
// ======================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});


// ======================================================
// COMMAND GROUPS
// ======================================================

// Existing / OLD game automation
const oldGameCommands = [
  "price",
  "game",
  "history",
  "deals",
  "freegames"
];

// New game watchlist automation
const newGameCommands = [
  "watch",
  "unwatch",
  "watchlist",
  "alerts",
  "clearwatchlist"
];

// Finance automation
const financeCommands = [
  "market",
  "stock",
  "compare",
  "beststock",
  "gold",
  "usd",
  "news"
];


// ======================================================
// BOT READY
// ======================================================

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});


// ======================================================
// MESSAGE HANDLER
// ======================================================

client.on("messageCreate", async (message) => {

  // Ignore messages from bots
  if (message.author.bot) {
    return;
  }

  // Get message content
  const content = message.content.trim();

  // Only process commands beginning with !
  if (!content.startsWith("!")) {
    return;
  }

  console.log(`Received: ${content}`);


  // ====================================================
  // EXTRACT COMMAND
  // ====================================================

  const command = content
    .slice(1)
    .trim()
    .split(/\s+/)[0]
    .toLowerCase();

  console.log(`Command: ${command}`);


  // ====================================================
  // DETERMINE DESTINATION WEBHOOK
  // ====================================================

  let webhookUrl = null;
  let webhookType = null;


  // OLD GAME
  if (oldGameCommands.includes(command)) {

    webhookUrl = OLD_GAME_WEBHOOK_URL;
    webhookType = "OLD GAME";

  }

  // NEW GAME
  else if (newGameCommands.includes(command)) {

    webhookUrl = NEW_GAME_WEBHOOK_URL;
    webhookType = "NEW GAME";

  }

  // FINANCE
  else if (financeCommands.includes(command)) {

    webhookUrl = FINANCE_WEBHOOK_URL;
    webhookType = "FINANCE";

  }

  // UNKNOWN
  else {

    console.log(`Unknown command: ${command}`);
    return;
  }


  // ====================================================
  // CHECK WEBHOOK
  // ====================================================

  if (!webhookUrl) {

    console.error(
      `Webhook URL is not configured for ${webhookType}`
    );

    return;
  }


  // ====================================================
  // SEND TO N8N
  // ====================================================

  try {

    const payload = {

      // Original Discord command
      content: content,

      // Command itself
      command: command,

      // Discord user
      user_id: message.author.id,
      username: message.author.username,

      // Discord server
      guild_id: message.guild?.id || "",

      // Channel / Forum post / Thread
      channel_id: message.channel.id,

      // Original Discord message
      message_id: message.id
    };


    console.log(
      `Sending to ${webhookType} webhook...`
    );

    console.log(payload);


    const response = await fetch(webhookUrl, {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(payload)

    });


    // ==================================================
    // HANDLE N8N RESPONSE
    // ==================================================

    if (!response.ok) {

      const errorText = await response.text();

      console.error(
        `n8n webhook failed: ${response.status}`
      );

      console.error(errorText);

      return;
    }


    console.log(
      `Sent ${content} to ${webhookType} webhook: ${response.status}`
    );

  }

  catch (error) {

    console.error(
      `Failed to send ${content} to n8n:`,
      error
    );

  }

});


// ======================================================
// LOGIN
// ======================================================

client.login(BOT_TOKEN);