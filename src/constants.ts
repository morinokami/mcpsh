export const Method = {
	ping: "ping",
	listPrompts: "prompts/list",
	getPrompt: "prompts/get",
	listResources: "resources/list",
	readResource: "resources/read",
	listResourceTemplates: "resources/templates/list",
	listTools: "tools/list",
	callTool: "tools/call",
	complete: "completion/complete",
	setLoggingLevel: "logging/setLevel",
} as const;
