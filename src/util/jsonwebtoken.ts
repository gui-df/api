import { verify, sign } from "jsonwebtoken";
import ms from "ms";

export const tokenExpire = ms("7d");
export const JWT_SECRET = process.env.JWT_SECRET ?? "";

export function verifyToken(token: string | undefined) {
	if (!token) return undefined;
	try {
		const t = verify(token, JWT_SECRET, { algorithms: ["HS512"] });
		return t as { userId: string };
	} catch {
		return undefined;
	}
}
export function createToken(userId: string) {
	return sign({ userId }, JWT_SECRET, {
		algorithm: "HS512",
		expiresIn: tokenExpire,
	});
}
