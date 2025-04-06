import type { CompleterResult } from "node:readline";
import type {
	ListPromptsResult,
	ListToolsResult,
	ServerCapabilities,
} from "@modelcontextprotocol/sdk/types.js";

import { Method } from "./constants";
import { parseQuery } from "./parse";

const ClientNotifications = [
	Method.cancelledNotification,
	Method.progressNotification,
	Method.initializedNotification,
	Method.rootsListChangedNotification,
];

export type CompletionSchema = {
	prompts?: ListPromptsResult["prompts"];
	tools?: ListToolsResult["tools"];
};

export function complete(
	line: string,
	capabilities: ServerCapabilities,
	// biome-ignore lint/correctness/noUnusedVariables: not implemented yet
	schema: CompletionSchema,
): CompleterResult {
	const availableMethods = Object.values(Method)
		.filter((method) => {
			if (method === Method.ping) {
				return true;
			}
			const methodCategory = method.split("/")[0];
			if (methodCategory === "completion") {
				return capabilities && capabilities.completions !== undefined;
			}
			return capabilities && capabilities[methodCategory] !== undefined;
		})
		.concat(ClientNotifications);

	const methodsCompletion = availableMethods.filter((availableMethod) =>
		availableMethod.startsWith(line.trimStart()),
	);
	if (methodsCompletion.length > 0) {
		return [methodsCompletion, line];
	}

	try {
		// biome-ignore lint/correctness/noUnusedVariables: not implemented yet
		const { method, params } = parseQuery(line);

		if (params === undefined) {
			return [[], line];
		}

		// TODO: Implement completion for methods with params
		return [[], line];
	} catch (_error) {
		return [[], line];
	}
}
