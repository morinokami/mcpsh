import type { ServerCapabilities } from "@modelcontextprotocol/sdk/types.js";
import type { CompletionSchema } from "./complete";

export const capabilities: ServerCapabilities = {
	prompts: {},
	tools: {},
};

export const schema: CompletionSchema = {
	prompts: [
		{
			name: "simple_prompt",
			description: "A prompt without arguments",
		},
		{
			name: "complex_prompt",
			description: "A prompt with arguments",
			arguments: [
				{
					name: "temperature",
					description: "Temperature setting",
					required: true,
				},
				{
					name: "style",
					description: "Output style",
					required: false,
				},
			],
		},
	],
	tools: [
		{
			name: "echo",
			description: "Echoes back the input",
			inputSchema: {
				type: "object",
				properties: {
					message: {
						type: "string",
						description: "Message to echo",
					},
				},
				required: ["message"],
				additionalProperties: false,
				$schema: "http://json-schema.org/draft-07/schema#",
			},
		},
		{
			name: "add",
			description: "Adds two numbers",
			inputSchema: {
				type: "object",
				properties: {
					a: {
						type: "number",
						description: "First number",
					},
					b: {
						type: "number",
						description: "Second number",
					},
				},
				required: ["a", "b"],
				additionalProperties: false,
				$schema: "http://json-schema.org/draft-07/schema#",
			},
		},
		{
			name: "printEnv",
			description:
				"Prints all environment variables, helpful for debugging MCP server configuration",
			inputSchema: {
				type: "object",
				properties: {},
				additionalProperties: false,
				$schema: "http://json-schema.org/draft-07/schema#",
			},
		},
		{
			name: "getTinyImage",
			description: "Returns the MCP_TINY_IMAGE",
			inputSchema: {
				type: "object",
				properties: {},
				additionalProperties: false,
				$schema: "http://json-schema.org/draft-07/schema#",
			},
		},
	],
};
