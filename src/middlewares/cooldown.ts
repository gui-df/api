import type { RequestServer, ResponseServer } from "azurajs/types";
import { verifyToken } from "../util/jsonwebtoken";
import { UNAUTHORIZED } from "../util/responses";
export type NextFunction = (err?: Error | unknown) => void | Promise<void>;
// <ip ou id do usuário, [timestamp que expira, requisições feitas]
const cooldownData = new Map<string, [number, number]>();
export function CooldownMiddleware(reqs: number, time: number, auth = false) {
	return function (
		req: RequestServer,
		res: ResponseServer,
		next?: NextFunction,
	) {
		let authenticator = req.ip;
		const t = verifyToken(req.cookies.discordUser);
		if (!t) {
			if (!auth) return res.status(401).json(UNAUTHORIZED);
		}
		if (t) authenticator = t.userId;
		const d = cooldownData.get(authenticator);
		if (!d) {
			cooldownData.set(authenticator, [Date.now() + time, 1]);
			return next ? next() : res.status(500).json({ error: true, code: 5 });
		}
		if (d[0] < Date.now()) {
			cooldownData.set(authenticator, [Date.now() + time, 1]);
			return next ? next() : res.status(500).json({ error: true, code: 5 });
		}
		if (d[1] >= reqs) {
			return res.status(429).json({ error: true, code: 1 });
		}

		cooldownData.set(authenticator, [d[0], d[1] + 1]);

		if (next) return next();
		else return res.status(500).json({ error: true, code: 5 });
	};
}
