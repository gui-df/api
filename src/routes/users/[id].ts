import type { RequestServer, ResponseServer } from "azurajs/types";
import { verifyToken } from "../../util/jsonwebtoken";
import { UNAUTHORIZED } from "../../util/responses";
import { prisma } from "../..";
import { userFormat } from "./@me";

export async function UsersIdGet({
	req,
	res,
}: {
	req: RequestServer;
	res: ResponseServer;
}) {
	const t = verifyToken(req.cookies.discordUser);
	if (!t) {
		res.status(401).json(UNAUTHORIZED);
		return;
	}
	const user = await prisma.user.findFirst({ where: { id: t.userId } });
	if (!user) {
		res.status(401).json(UNAUTHORIZED);
		return;
	}
	const _userBots = await prisma.bot.findMany({
		where: { botOwnerId: user.id },
	});
	res.status(200).json(userFormat(user));
}
