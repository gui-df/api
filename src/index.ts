import { AzuraClient } from "azurajs";
import AuthCallback from "./routes/auth/callback";
import BunPostgresAdapter from "@abcx3/prisma-bun-adapter";
import { PrismaClient } from "./generated/prisma/client";
import AuthLogout from "./routes/auth/logout";
import { UsersMeGet, UsersMePut } from "./routes/users/@me";
import { UsersIdGet } from "./routes/users/[id]";
import { BotsIdPost } from "./routes/bots/create";
import { CooldownMiddleware } from "./middlewares/cooldown";
import ms from "ms";

const adapter = new BunPostgresAdapter({
	connectionString: process.env.DATABASE_URL ?? "",
});
export const prisma = new PrismaClient({ adapter });

const app = new AzuraClient();
const globalCooldown = [CooldownMiddleware(3, ms("500ms"), 'global-500ms'), CooldownMiddleware(64800, ms("12h"), 'global-12h')];
app.get(
	"/api/auth/callback",
	...globalCooldown,
	CooldownMiddleware(1, ms("5s"), "oauth"),
	AuthCallback,
);
app.get("/api/auth/logout", ...globalCooldown, AuthLogout);
app.post(
	"/api/bots/:id",
	...globalCooldown,
	CooldownMiddleware(1, ms("3s"), "send-bot", true),
	BotsIdPost,
);
app.get("/api/users/@me", ...globalCooldown, UsersMeGet);
app.put("/api/users/@me", ...globalCooldown, UsersMePut);
app.get("/api/users/:id", ...globalCooldown, UsersIdGet);

Bun.serve({ fetch: app.fetch.bind(app), port: process.env.API_PORT || 3000 });
