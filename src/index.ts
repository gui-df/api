import { AzuraClient } from "azurajs";
import AuthCallback from "./routes/auth/callback";
import BunPostgresAdapter from "@abcx3/prisma-bun-adapter";
import { PrismaClient } from "./generated/prisma/client";
import AuthLogout from "./routes/auth/logout";
import { UsersMeGet, UsersMePut } from "./routes/users/@me";

const adapter = new BunPostgresAdapter({
	connectionString: process.env.DATABASE_URL ?? "",
});
export const prisma = new PrismaClient({ adapter });

const app = new AzuraClient();

app.get("/api/auth/callback", AuthCallback);
app.get("/api/auth/logout", AuthLogout);
app.get("/api/users/@me", UsersMeGet);
app.put("/api/users/@me", UsersMePut);

Bun.serve({ fetch: app.fetch.bind(app), port: process.env.API_PORT || 3000 });
