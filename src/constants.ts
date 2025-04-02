import {
	CancelledNotificationSchema,
	LoggingMessageNotificationSchema,
	ProgressNotificationSchema,
	PromptListChangedNotificationSchema,
	ResourceListChangedNotificationSchema,
	ResourceUpdatedNotificationSchema,
	ToolListChangedNotificationSchema,
} from "@modelcontextprotocol/sdk/types.js";

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

export const ServerNotificationSchemas = [
	CancelledNotificationSchema,
	ProgressNotificationSchema,
	LoggingMessageNotificationSchema,
	ResourceUpdatedNotificationSchema,
	ResourceListChangedNotificationSchema,
	ToolListChangedNotificationSchema,
	PromptListChangedNotificationSchema,
];
