import readline from "node:readline/promises";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
	type CallToolRequest,
	CallToolRequestSchema,
	type CancelledNotification,
	CancelledNotificationSchema,
	type CompleteRequest,
	CompleteRequestSchema,
	type GetPromptRequest,
	GetPromptRequestSchema,
	InitializedNotificationSchema,
	type ListPromptsRequest,
	ListPromptsRequestSchema,
	type ListResourcesRequest,
	ListResourcesRequestSchema,
	ListResourceTemplatesRequestSchema,
	ListToolsRequestSchema,
	type LoggingLevel,
	type Notification,
	PingRequestSchema,
	type ProgressNotification,
	ProgressNotificationSchema,
	type ReadResourceRequest,
	ReadResourceRequestSchema,
	type Request,
	type Result,
	type RootsListChangedNotification,
	RootsListChangedNotificationSchema,
	SetLevelRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ZodError } from "zod";

import { Method, ServerNotificationSchemas } from "./constants.js";
import { blue, green, red, yellow } from "./io.js";
import { name, version } from "./meta.js";
import { parseQuery } from "./parse.js";

// TODO: add support for the Streamable HTTP transport
// TODO: auth

export class MCPClient {
	private mcp: Client;
	private transport: StdioClientTransport | null = null;
	private rl: readline.Interface | null = null;

	constructor() {
		this.mcp = new Client(
			{ name, version },
			{
				capabilities: {
					// TODO: sampling: {},
					// TODO: roots: {},
				},
			},
		);
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

			ServerNotificationSchemas.forEach((schema) => {
				this.mcp.setNotificationHandler(schema, (notification) =>
					this.handleNotification(notification),
				);
			});

			const version = await this.mcp.getServerVersion();
			if (version) {
				console.log(`Connected to ${version.name} ${version.version}`);
			}
		} catch (error) {
			console.log("Failed to connect to server: ", error);
			throw error;
		}
	}

	async loop() {
		return new Promise<void>((resolve) => {
			this.rl = readline.createInterface({
				input: process.stdin,
				output: process.stdout,
				prompt: "> ",
				historySize: 1000,
				completer: (line) => {
					const capabilities = this.mcp.getServerCapabilities();
					const availableMethods = Object.values(Method)
						.filter((method) => {
							if (method === Method.ping) {
								return true;
							}
							return (
								capabilities && capabilities[method.split("/")[0]] !== undefined
							);
						})
						.concat([
							Method.cancelledNotification,
							Method.progressNotification,
							Method.initializedNotification,
							Method.rootsListChangedNotification,
						]);
					const completions = availableMethods.filter((method) =>
						method.startsWith(line),
					);
					return [completions, line];
				},
			});

			this.rl.prompt();

			this.rl.on("SIGINT", () => this.rl?.close());

			this.rl.on("line", async (line) => {
				const query = line.trim();

				if (query.length === 0) {
					this.rl?.prompt();
					return;
				}

				if (query === "quit" || query === "q") {
					this.rl?.close();
					resolve();
					return;
				}

				try {
					const { method, params } = parseQuery(query);
					await this.processQuery(method, params);
				} catch (error) {
					if (error instanceof ZodError) {
						red(`Invalid query: ${error}`);
					} else if (error instanceof Error) {
						red(error.message);
					}
				}

				this.rl?.prompt();
			});

			this.rl.on("close", () => {
				resolve();
			});
		});
	}

	async cleanup() {
		await this.mcp.close();
	}

	async processQuery(method: string, params?: Record<string, unknown>) {
		const methodHandlers = {
			[Method.ping]: {
				parse: (req: Request) => PingRequestSchema.parse(req),
				dispatch: () => this.mcp.ping(),
			},
			[Method.listPrompts]: {
				parse: (req: Request) => ListPromptsRequestSchema.parse(req),
				dispatch: (params: ListPromptsRequest["params"]) =>
					this.mcp.listPrompts(params),
			},
			[Method.getPrompt]: {
				parse: (req: Request) => GetPromptRequestSchema.parse(req),
				dispatch: (params: GetPromptRequest["params"]) =>
					this.mcp.getPrompt(params),
			},
			[Method.listResources]: {
				parse: (req: Request) => ListResourcesRequestSchema.parse(req),
				dispatch: (params: ListResourcesRequest["params"]) =>
					this.mcp.listResources(params),
			},
			[Method.readResource]: {
				parse: (req: Request) => ReadResourceRequestSchema.parse(req),
				dispatch: (params: ReadResourceRequest["params"]) =>
					this.mcp.readResource(params),
			},
			[Method.listResourceTemplates]: {
				parse: (req: Request) => ListResourceTemplatesRequestSchema.parse(req),
				dispatch: (params: ListResourcesRequest["params"]) =>
					this.mcp.listResourceTemplates(params),
			},
			[Method.listTools]: {
				parse: (req: Request) => ListToolsRequestSchema.parse(req),
				dispatch: (params: ListResourcesRequest["params"]) =>
					this.mcp.listTools(params),
			},
			[Method.callTool]: {
				parse: (req: Request) => CallToolRequestSchema.parse(req),
				dispatch: (params: CallToolRequest["params"]) =>
					this.mcp.callTool(params),
			},
			[Method.complete]: {
				parse: (req: Request) => CompleteRequestSchema.parse(req),
				dispatch: (params: CompleteRequest["params"]) =>
					this.mcp.complete(params),
			},
			[Method.setLoggingLevel]: {
				parse: (req: Request) => SetLevelRequestSchema.parse(req),
				dispatch: (params: { level: LoggingLevel }) =>
					this.mcp.setLoggingLevel(params.level),
			},
			[Method.cancelledNotification]: {
				parse: (req: Request) => CancelledNotificationSchema.parse(req),
				dispatch: (params: CancelledNotification["params"]) =>
					this.mcp.notification({
						method: Method.cancelledNotification,
						params,
					}),
			},
			[Method.progressNotification]: {
				parse: (req: Request) => ProgressNotificationSchema.parse(req),
				dispatch: (params: ProgressNotification["params"]) =>
					this.mcp.notification({
						method: Method.progressNotification,
						params,
					}),
			},
			[Method.initializedNotification]: {
				parse: (req: Request) => InitializedNotificationSchema.parse(req),
				dispatch: () =>
					this.mcp.notification({ method: Method.initializedNotification }),
			},
			[Method.rootsListChangedNotification]: {
				parse: (req: Request) => RootsListChangedNotificationSchema.parse(req),
				dispatch: (params: RootsListChangedNotification["params"]) =>
					this.mcp.notification({
						method: Method.rootsListChangedNotification,
						params,
					}),
			},
		} as const;

		if (!(method in methodHandlers)) {
			throw new Error(`Unknown method: ${method}`);
		}

		const { parse, dispatch } =
			methodHandlers[method as keyof typeof methodHandlers];
		const request = parse({ method, params });
		green(`Request: ${JSON.stringify(request, null, 2)}`);

		let response: Result;
		if (method === Method.ping) {
			response = await this.mcp.ping();
		} else {
			// biome-ignore lint/suspicious/noExplicitAny:
			const result = await dispatch(request.params as any);
			if (!result) {
				return;
			}
			response = result;
		}
		blue(`Response: ${JSON.stringify(response, null, 2)}`);
	}

	async handleNotification(notification: Notification) {
		if (this.rl) {
			const currentPrompt = this.rl.getPrompt();
			// print notification
			this.rl.pause();
			console.log();
			yellow(`Notification: ${JSON.stringify(notification, null, 2)}`);
			// restore prompt
			this.rl.resume();
			this.rl.setPrompt(currentPrompt);
			this.rl.prompt();
			this.rl.write(null, { ctrl: true, name: "e" });
		}
	}
}
