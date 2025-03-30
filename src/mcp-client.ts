import readline from "node:readline/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
	CallToolRequestSchema,
	CompleteRequestSchema,
	GetPromptRequestSchema,
	ListPromptsRequestSchema,
	ListResourcesRequestSchema,
	ListResourceTemplatesRequestSchema,
	ListToolsRequestSchema,
	PingRequestSchema,
	ReadResourceRequestSchema,
	SetLevelRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { Method } from "./constants.js";
import { printError, printRequest, printResponse } from "./io.js";
import { parseQuery } from "./parse.js";

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

			const version = await this.mcp.getServerVersion();
			if (version) {
				console.log(`Connected to ${version.name} ${version.version}`);
			}
			// console.log("Capabilities:", this.mcp.getServerCapabilities());
			// console.log("Instructions:", this.mcp.getInstructions());
		} catch (error) {
			console.log("Failed to connect to server: ", error);
			throw error;
		}
	}

	async processQuery(method: string, params?: Record<string, unknown>) {
		switch (method) {
			case Method.ping: {
				const request = PingRequestSchema.parse({ method });
				printRequest(request);
				const response = await this.mcp.ping();
				printResponse(response);
				break;
			}
			case Method.listPrompts: {
				const request = ListPromptsRequestSchema.parse({ method, params });
				printRequest(request);
				const response = await this.mcp.listPrompts(request.params);
				printResponse(response);
				break;
			}
			case Method.getPrompt: {
				const request = GetPromptRequestSchema.parse({ method, params });
				printRequest(request);
				const response = await this.mcp.getPrompt(request.params);
				printResponse(response);
				break;
			}
			case Method.listResources: {
				const request = ListResourcesRequestSchema.parse({ method, params });
				printRequest(request);
				const response = await this.mcp.listResources(request.params);
				printResponse(response);
				break;
			}
			case Method.readResource: {
				const request = ReadResourceRequestSchema.parse({ method, params });
				printRequest(request);
				const response = await this.mcp.readResource(request.params);
				printResponse(response);
				break;
			}
			case Method.listResourceTemplates: {
				const request = ListResourceTemplatesRequestSchema.parse({
					method,
					params,
				});
				printRequest(request);
				const response = await this.mcp.listResourceTemplates(request.params);
				printResponse(response);
				break;
			}
			case Method.listTools: {
				const request = ListToolsRequestSchema.parse({ method, params });
				printRequest(request);
				const response = await this.mcp.listTools(request.params);
				printResponse(response);
				break;
			}
			case Method.callTool: {
				const request = CallToolRequestSchema.parse({ method, params });
				printRequest(request);
				const response = await this.mcp.callTool(request.params);
				printResponse(response);
				break;
			}
			case Method.complete: {
				const request = CompleteRequestSchema.parse({ method, params });
				printRequest(request);
				const response = await this.mcp.complete(request.params);
				printResponse(response);
				break;
			}
			case Method.setLoggingLevel: {
				const request = SetLevelRequestSchema.parse({ method, params });
				printRequest(request);
				const response = await this.mcp.setLoggingLevel(request.params.level);
				printResponse(response);
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
				completer: (line) => {
					// TODO: Use server capabilities to filter available completions
					const methods = Object.values(Method);
					const completions = methods.filter((method) =>
						method.startsWith(line),
					);
					return [completions, line];
				},
			});

			rl.prompt();

			rl.on("SIGINT", () => rl.close());

			rl.on("line", async (line) => {
				const query = line.trim();

				if (query.length === 0) {
					rl.prompt();
					return;
				}

				if (query === "quit" || query === "q") {
					rl.close();
					resolve();
					return;
				}

				try {
					const { method, params } = parseQuery(query);
					await this.processQuery(method, params);
				} catch (error) {
					if (error instanceof Error) {
						printError(error);
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
}

export default MCPClient;
