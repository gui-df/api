import type { RequestServer, ResponseServer } from "azurajs/types";
import { CreateBotSchema } from "../../schemas/bot";
import { basic_webhook, bot, mod_webhook } from "../../util/discord";
import { EmbedBuilder } from "discord.js";
import { BOT_EXISTS, NOT_A_BOT, UNAUTHORIZED } from "../../util/responses";
import { prisma } from "../..";
import { verifyToken } from "../../util/jsonwebtoken";

export async function BotsIdPost({
	req,
	res,
}: {
	req: RequestServer;
	res: ResponseServer;
}) {
	const id = req.params.id ?? "sla";
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
	const createBotValidator = CreateBotSchema.safeParse(req.body);
	if (!createBotValidator.success)
		return res.json({
			error: true,
			data: createBotValidator.error.issues.map((e) => [
				e.path.join("."),
				e.message,
			]),
		});
	const body = createBotValidator.data;

	if (await prisma.bot.count({ where: { discordId: id } }))
		return res.status(400).json(BOT_EXISTS);

	const discordBot = await bot.users.fetch(id, { cache: true }).catch(() => {});
	if (!discordBot || !discordBot.bot || discordBot.system)
		return res.status(400).json(NOT_A_BOT);
	await prisma.bot
		.create({
			data: {
				discordId: id,
				botOwnerId: user.id,
				avatarUrl: discordBot.displayAvatarURL({ size: 512 }),
				tags: body.tags,
				prefixes: body.prefixes,
				longDescription: body.longDescription,
				shortDescription: body.shortDescription,
				websiteUrl: body.websiteUrl,
				sourceCode: body.sourceCode,
				supportServer: body.supportServer,
				approved: false,
			},
		})
		.then(() => {});
	const embeds = [
		new EmbedBuilder()
			.setColor("Aqua")
			.setTimestamp()
			.setTitle("Novo Bot")
			.setDescription(
				[
					`O usuário **${user.displayName}** (**@${user.username}** - ${user.id}) enviou o bot **${discordBot.tag}**(${discordBot.id}) para análise.`,
					"",
					"**Descrição Longa:**",
					"```md",
					body.longDescription,
					"```",
				].join("\n"),
			)
			.addFields([
				{
					inline: true,
					name: "Descrição curta",
					value: body.shortDescription,
				},
				{
					inline: true,
					name: `Prefixos (${body.prefixes.length})`,
					value: body.prefixes.map((j) => `\`${j}\``).join(", "),
				},
				{
					inline: true,
					name: `Tags (${body.tags.length})`,
					value: body.tags.map((j) => `\`${j}\``).join(", "),
				},
				{
					inline: true,
					name: `Servidor de Suporte`,
					value: body.supportServer
						? body.supportServer
						: "Não definido pelo usuário.",
				},
				{
					inline: true,
					name: `Código fonte`,
					value: body.sourceCode
						? body.sourceCode
						: "Não definido pelo usuário.",
				},
				{
					inline: true,
					name: `Site do Bot`,
					value: body.websiteUrl
						? body.websiteUrl
						: "Não definido pelo usuário.",
				},
				{
					inline: true,
					name: `Link de Convite do Bot`,
					value: `[Clique Aqui](https://discord.com/api/oauth2/authorize?client_id=${discordBot.id}&permissions=0&scope=bot%20applications.commands)`,
				},
			]),
	];
	await basic_webhook
		.send({
			embeds,
		})
		.catch(() => {});
	await mod_webhook
		.send({
			embeds,
		})
		.catch(() => {});
	res.status(200).json({ error: false });
}
