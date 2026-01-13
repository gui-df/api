import type { RequestServer, ResponseServer } from "azurajs/types";
import { verifyToken } from "../util/jsonwebtoken";
import { UNAUTHORIZED } from "../util/responses";
export type NextFunction = (err?: Error | unknown) => void | Promise<void>;
// <ip ou id do usuário, [timestamp que expira, requisições feitas]
const cooldownData: Record<string, Map<string, [number, number]>> = {};
export function CooldownMiddleware(
    reqs: number,
    time: number,
    code = "global",
    auth = false,
) {
    if (!cooldownData[code])
        cooldownData[code] = new Map<string, [number, number]>();
    return function (
        req: RequestServer,
        res: ResponseServer,
        next?: NextFunction,
    ) {
        if (!cooldownData[code])
            cooldownData[code] = new Map<string, [number, number]>();
        let authenticator = removeIpv6Subnets(req.ip ?? '127.0.0.1');
        let t = verifyToken(req.cookies.discordUser);
        if (!t && auth) return res.status(401).json(UNAUTHORIZED);
        if (t) authenticator = t.userId;
        const d = cooldownData[code].get(authenticator);
        console.log(d)
        if (!d) {
            cooldownData[code].set(authenticator, [Date.now() + time, 1]);
            return next?.();
        }
        if (d[0] < Date.now()) {
            cooldownData[code].set(authenticator, [Date.now() + time, 1]);
            return next?.();
        }
        if (d[1] >= reqs) {
            return res.status(429).json({ error: true, code: 1 });
        }

        cooldownData[code].set(authenticator, [d[0], d[1] + 1]);

        return next?.();
    };
}


setInterval(() => {
    for (const b in cooldownData) {
        const c = cooldownData[b]
        if (c) {
            c.forEach((v, k) => {
                if (v[0] < Date.now()) cooldownData[b]?.delete(k)
            })
        }
    }
}, 600_000);

function removeIpv6Subnets(ip: string) {
    if (!ip.includes(":")) return ip
    return ip.split(":").slice(0, 4).join(":")
}