import type { RequestServer, ResponseServer } from "azurajs/types";
import { verifyToken } from "../../util/jsonwebtoken";
//GET
export default async function AuthLogout({
	req,
	res,
}: {
	req: RequestServer;
	res: ResponseServer;
}) {
	const t = verifyToken(req.cookies.discordUser);
	console.log(t);
	if (t) {
		res
			.clearCookie("discordUser", { path: "/" })
			.status(200)
			.json({ ok: true });
	} else res.status(401).json({ ok: false });
}
