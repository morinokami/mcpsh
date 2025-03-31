#!/usr/bin/env node

import { MCPClient } from "./mcp-client.js";

async function main() {
	if (process.argv.length < 3) {
		console.log("Usage: npx mcpsh <path_to_server_script>");
		return;
	}

	const mcpClient = new MCPClient();
	try {
		await mcpClient.connectToServer(process.argv[2]);
		await mcpClient.loop();
	} finally {
		await mcpClient.cleanup();
		process.exit(0);
	}
}

main();
