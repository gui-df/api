export const clientId = process.env.DISCORD_OAUTH_ID ?? "";
export const clientSecret = process.env.DISCORD_OAUTH_SECRET ?? "";
export const scopes = ["identify"];
export const redirectUri = `${process.env.WEBSITE_DOMAIN}/api/auth/callback`;
export const oauthUri = `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}&prompt=none&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(" "))}`;
export const discordApi = "https://discord.com/api/v10";
