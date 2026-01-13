import { Client, WebhookClient } from "discord.js";

export const bot = new Client({ intents: ["Guilds"] });

export const basic_webhook = new WebhookClient({
	url: process.env.BASIC_WEBHOOK_URL ?? "",
});
export const mod_webhook = new WebhookClient({
	url: process.env.MOD_WEBHOOK_URL ?? "",
});

bot.login(process.env.DISCORD_TOKEN ?? "");
