import { styleText } from "node:util";
import type { Notification } from "@modelcontextprotocol/sdk/types.js";

export function printRequest(request: Record<string, unknown>) {
	console.log(
		styleText("green", `Request: ${JSON.stringify(request, null, 2)}`),
	);
}

export function printResponse(response: Record<string, unknown>) {
	console.log(
		styleText("blue", `Response: ${JSON.stringify(response, null, 2)}`),
	);
}

export function printError(error: Error) {
	console.error(styleText("red", `${error.message}`));
}

export function printNotification(notification: Notification) {
	console.log(
		styleText(
			"yellow",
			`Notification: ${JSON.stringify(notification, null, 2)}`,
		),
	);
}
