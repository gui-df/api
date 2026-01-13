import type { RequestServer, ResponseServer } from "azurajs/types";
import { verifyToken } from "../../util/jsonwebtoken";
import { UNAUTHORIZED } from "../../util/responses";
import { prisma } from "../..";
import { UserUpdateSchema } from "../../schemas/user";
import type { User } from "../../generated/prisma/client";

export async function UsersMeGet({
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

export async function UsersMePut({
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

	const body = UserUpdateSchema.safeParse(req.body);
	if (!body.success) {
		res
			.status(400)
			.json({ error: true, data: body.error.issues.map((e) => e.message) });
		return;
	}

	const bdy = body.data;
	res.json({
		success: true,
		...userFormat(
			await prisma.user.update({ where: { id: t.userId }, data: bdy }),
		),
	});
}

export function userFormat(d: User) {
	return {
		id: d.id,
		username: d.username,
		displayName: d.displayName,
		bio: d.bio,
		avatar: d.avatarUrl ?? null,
	};
}
