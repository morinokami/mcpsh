#!/usr/bin/env node

import { defineCommand, runMain } from "citty";

import { description, name, version } from "../package.json";
import { MCPClient } from "./mcp-client.js";

const main = defineCommand({
	meta: {
		name,
		version,
		description,
	},
	args: {
		server: {
			type: "positional",
			description: "Path to server script",
			required: true,
		},
	},
	async run({ args }) {
		const mcpClient = new MCPClient();
		try {
			await mcpClient.connectToServer(args.server);
			await mcpClient.loop();
		} finally {
			await mcpClient.cleanup();
			process.exit(0);
		}
	},
});

runMain(main);
