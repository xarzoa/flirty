import { env } from "@/config";
import { Client, GatewayIntentBits, Partials } from "discord.js";
import { createResponse } from "@/ai";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
  ],
  partials: [Partials.Channel, Partials.User, Partials.Message],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("error", (error) => {
  console.error(error);
});

client.on("messageCreate", async (message) => {
  if (message.interaction) return;
  if (message.author.bot) return;
  if (message.channel.type === 1) {
    const res = await createResponse(message.content, parseInt(message.author.id));
    message.reply(res || "I'm sorry, I couldn't understand you.");
  }
});

client.login(env.BOT_TOKEN);
