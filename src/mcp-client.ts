import readline from "node:readline/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const Method = {
	ping: "ping",
	prompts: {
		list: "prompts/list",
	},
	resources: {
		list: "resources/list",
	},
	tools: {
		list: "tools/list",
	},
} as const;

class MCPClient {
	private mcp: Client;
	private transport: StdioClientTransport | null = null;

	constructor() {
		this.mcp = new Client({ name: "mcpsh", version: "0.0.1" });
	}

	async connectToServer(serverScriptPath: string) {
		try {
			const isJs = serverScriptPath.endsWith(".js");
			const isPy = serverScriptPath.endsWith(".py");
			if (!isJs && !isPy) {
				throw new Error("Server script must be a .js or .py file");
			}
			const command = isPy
				? process.platform === "win32"
					? "python"
					: "python3"
				: process.execPath;

			this.transport = new StdioClientTransport({
				command,
				args: [serverScriptPath],
			});
			await this.mcp.connect(this.transport);

			console.log("Connected to server");
			console.log("Version:", this.mcp.getServerVersion());
			console.log("Capabilities:", this.mcp.getServerCapabilities());
			console.log("Instructions:", this.mcp.getInstructions());
		} catch (error) {
			console.log("Failed to connect to server: ", error);
			throw error;
		}
	}

	async processQuery(query: string) {
		switch (query.toLowerCase()) {
			case Method.ping: {
				this.printRequest({ method: Method.ping });
				const response = await this.mcp.ping();
				this.printResponse(response);
				break;
			}
			default:
				console.error(`Unknown method: ${query}`);
				return;
		}
	}

	async loop() {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		try {
			while (true) {
				const query = await rl.question("> ");

				if (query.toLowerCase() === "quit" || query.toLowerCase() === "q") {
					break;
				}

				await this.processQuery(query);
			}
		} finally {
			rl.close();
		}
	}

	async cleanup() {
		await this.mcp.close();
	}

	printRequest(request: Record<string, unknown>) {
		console.log("Request:", JSON.stringify(request, null, 2));
	}

	printResponse(response: Record<string, unknown>) {
		console.log("Response:", JSON.stringify(response, null, 2));
	}
}

export default MCPClient;
