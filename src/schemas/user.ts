import z from "zod";

export const UserUpdateSchema = z.strictObject({
	bio: z.string().max(256).trim().optional(),
	displayName: z.string().max(32).trim().optional(),
});
