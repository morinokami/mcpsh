import readline from "node:readline/promises";
import { styleText } from "node:util";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
	CallToolRequestSchema,
	ListPromptsRequestSchema,
	ListResourcesRequestSchema,
	ListToolsRequestSchema,
	PingRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

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
		call: "tools/call",
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

	async processQuery(method: string, params?: Record<string, unknown>) {
		switch (method) {
			case Method.ping: {
				const request = PingRequestSchema.parse({ method });
				this.printRequest(request);
				const response = await this.mcp.ping();
				this.printResponse(response);
				break;
			}
			case Method.prompts.list: {
				const request = ListPromptsRequestSchema.parse({ method, params });
				this.printRequest(request);
				const response = await this.mcp.listPrompts(request.params);
				this.printResponse(response);
				break;
			}
			case Method.resources.list: {
				const request = ListResourcesRequestSchema.parse({ method, params });
				this.printRequest(request);
				const response = await this.mcp.listResources(request.params);
				this.printResponse(response);
				break;
			}
			case Method.tools.list: {
				const request = ListToolsRequestSchema.parse({ method, params });
				this.printRequest(request);
				const response = await this.mcp.listTools(request.params);
				this.printResponse(response);
				break;
			}
			case Method.tools.call: {
				const request = CallToolRequestSchema.parse({ method, params });
				this.printRequest(request);
				const response = await this.mcp.callTool(request.params);
				this.printResponse(response);
				break;
			}
			default:
				throw new Error(`Unknown method: ${method}`);
		}
	}

	async loop() {
		return new Promise<void>((resolve) => {
			const rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
				prompt: "> ",
				historySize: 1000,
			});

			rl.prompt();

			rl.on("SIGINT", () => rl.close());

			rl.on("line", async (line) => {
				const query = line.trim();

				if (query === "quit" || query === "q") {
					rl.close();
					resolve();
					return;
				}

				try {
					const { method, params } = this.parseQuery(query);
					await this.processQuery(method, params);
				} catch (error) {
					if (error instanceof Error) {
						console.error(error.message);
					}
				}

				rl.prompt();
			});

			rl.on("close", () => {
				resolve();
			});
		});
	}

	async cleanup() {
		await this.mcp.close();
	}

	private parseQuery(query: string) {
		// query = [method] ([params])
		const dividerIndex = query.indexOf(" ");
		if (dividerIndex === -1) {
			return { method: query };
		}

		const method = query.slice(0, dividerIndex).trim();
		const paramsString = query.slice(dividerIndex + 1).trim();
		try {
			const ParamsSchema = z.record(z.string(), z.unknown());
			const params = ParamsSchema.parse(JSON.parse(paramsString));
			return { method, params };
		} catch (_error) {
			throw new Error(`Invalid params: ${paramsString}`);
		}
	}

	private printRequest(request: Record<string, unknown>) {
		console.log(
			styleText("green", `Request: ${JSON.stringify(request, null, 2)}`),
		);
	}

	private printResponse(response: Record<string, unknown>) {
		console.log(
			styleText("blue", `Response: ${JSON.stringify(response, null, 2)}`),
		);
	}
}

export default MCPClient;
