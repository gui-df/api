import type { ConfigTypes } from "azurajs/config";

const config: ConfigTypes = {
	environment:
		(process.env.NODE_ENV as "development" | undefined) || "development",
	server: {
		port: 3000,
		cluster: false,
		ipHost: true,
		https: false,
		trustProxy: true,
		ipHeader: 'CF-Connecting-IP'
	},
	logging: {
		enabled: true,
		showDetails: true,
	},
	plugins: {
		cors: {
			enabled: true,
			origins: ["*"],
			methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
			allowedHeaders: ["Content-Type", "Authorization"],
		},
		rateLimit: {
			enabled: false,
			limit: 100,
			timeframe: 60000, // 1 minute
		},
	},
};

export default config;
