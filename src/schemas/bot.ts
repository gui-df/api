import { array, strictObject, string, url } from "zod";

export const CreateBotSchema = strictObject({
	shortDescription: string()
		.trim()
		.min(50, "Short description should be greater or equal to 50 characters")
		.max(80, "short description should be less than or equal to 80 characters"),
	longDescription: string()
		.trim()
		.min(200, "Long description should be greater or equal to 200 characters")
		.max(
			4096,
			"Long description should be less than or equal to 4096 characters",
		),
	prefixes: array(
		string().trim().max(6, "The max prefix length is 6 characters"),
	)
		.max(5, "You only can add 5 prefixes")
		.refine(
			(prefixes: string[]) =>
				prefixes && new Set(prefixes).size === prefixes.length,
			"The same prefix can't repeat",
		),
	tags: array(
		string()
			.trim()
			.max(24, "The max tag length is 24 characters")
			.regex(
				/^[\w\-À-ÿ]+$/u,
				"The tag only can have characters from A-Za-z0-9 and character accents",
			),
	)
		.max(5, "You only can add 5 tags")
		.refine(
			(tags) => new Set(tags).size === tags.length,
			"Cannot have 2 same tags",
		),
	websiteUrl: url().optional(),
	sourceCode: url().optional(),
	supportServer: string()
		.regex(
			/^https:\/\/discord\.(gg|invite)\/[a-z0-9]+$/i,
			"Needs to be a valid Discord invite link (discord.gg/---)",
		)
		.optional(),
});

export const UpdateBotSchema = strictObject({
	short_description: string()
		.trim()
		.min(50, "Short description should be greater or equal to 50 characters")
		.max(80, "short description should be less than or equal to 80 characters")
		.optional(),
	long_description: string()
		.trim()
		.min(200, "Long description should be greater or equal to 200 characters")
		.max(
			4096,
			"Long description should be less than or equal to 4096 characters",
		)
		.optional(),
	prefixes: array(string().max(6, "The max prefix length is 6 characters"))
		.max(5, "You only can add 5 prefixes")
		.refine(
			(prefixes: string[]) =>
				prefixes && new Set(prefixes).size === prefixes.length,
			"The same prefix can't repeat",
		)
		.optional(),
	tags: array(
		string()
			.max(24, "The max tag length is 24 characters")
			.regex(
				/^[\w\-À-ÿ]+$/u,
				"The tag only can have characters from A-Za-z0-9 and character accents",
			),
	)
		.max(5, "You only can add 5 tags")
		.refine(
			(tags) => new Set(tags).size === tags.length,
			"Cannot have 2 same tags",
		)
		.optional(),
	website_url: url().optional(),
	source_code: url().optional(),
	support_server: string()
		.regex(
			/^https:\/\/discord\.(gg|invite)\/[a-z0-9]+$/i,
			"Needs to be a valid discord invite link (discord.gg/---)",
		)
		.optional(),
});
