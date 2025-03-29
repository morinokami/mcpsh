import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";

class MCPClient {
	private mcp: Client;
	private transport: StdioClientTransport | null = null;
	private tools: Tool[] = [];

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
			this.mcp.connect(this.transport);

			this.tools = (await this.mcp.listTools()).tools;
			console.log(
				"Connected to server with tools:",
				this.tools.map(({ name }) => name),
			);
		} catch (error) {
			console.log("Failed to connect to server: ", error);
			throw error;
		}
	}

	async loop() {
		console.log("> TODO: loop");
	}

	async cleanup() {
		await this.mcp.close();
	}
}

export default MCPClient;
