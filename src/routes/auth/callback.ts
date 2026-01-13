import type { RequestServer, ResponseServer } from "azurajs/types";
import {
	clientId,
	clientSecret,
	discordApi,
	oauthUri,
	redirectUri,
	scopes,
} from "../../util/oauth2";
import { createToken, tokenExpire } from "../../util/jsonwebtoken";
import { prisma } from "../..";
//GET
export default async function ({
	req,
	res,
}: {
	req: RequestServer;
	res: ResponseServer;
}) {
	console.log(req, res);
	const { code } = req.query;
	if (!code) {
		res.redirect(oauthUri);
		return;
	}
	const data = {
		client_id: clientId,
		client_secret: clientSecret,
		grant_type: "authorization_code",
		code,
		redirect_uri: redirectUri,
		scope: scopes,
	};
	const tokenReq = await fetch([discordApi, "oauth2/token"].join("/"), {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: new URLSearchParams(data),
	});
	const tokenRes = (await tokenReq.json()) as {
		error?: string;
		access_token: string;
	};
	if (tokenRes.error) {
		res.redirect(oauthUri);
		return;
	}
	const token = `Bearer ${tokenRes.access_token}`;
	const userReq = await fetch([discordApi, "users/@me"].join("/"), {
		method: "GET",
		headers: {
			Authorization: token,
		},
	});
	const user = (await userReq.json()) as {
		error?: string;
		id: string;
		username: string;
		avatar: string;
		banner: string;
		global_name: string;
	};
	if (user.error || !user.username) {
		res.redirect(oauthUri);
		return;
	}
	const _token = createToken(user.id);
	if (!(await prisma.user.count({ where: { id: user.id } })))
		await prisma.user.create({
			data: {
				id: user.id,
				username: user.username,
				displayName: user.global_name ?? user.username,
				avatarUrl: user.avatar
					? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`
					: undefined,
			},
		});
	else
		await prisma.user.update({
			where: { id: user.id },
			data: {
				username: user.username,
				avatarUrl: user.avatar
					? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=512`
					: undefined,
			},
		});
	res
		.cookie("discordUser", _token, {
			expires: new Date(Date.now() + tokenExpire),
			path: "/",
			httpOnly: true,
			secure: process.env.COOKIE_SECURE === "true",
		})
		.redirect("/");
	return;
}
