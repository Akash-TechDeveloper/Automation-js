const { Client, GatewayIntentBits } = require("discord.js");

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const N8N_WEBHOOK_URL =
  "https://akz.app.n8n.cloud/webhook/discord-game-search";

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
  // Ignore messages sent by bots
  if (message.author.bot) {
    return;
  }

  const content = message.content.trim();

  // Only process commands starting with !
  if (!content.startsWith("!")) {
    return;
  }

  console.log(`Received: ${content}`);

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
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
      `Sent to n8n: ${response.status}`
    );
  } catch (error) {
    console.error("Failed to send to n8n:", error);
  }
});

client.login(BOT_TOKEN);