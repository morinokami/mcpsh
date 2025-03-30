import { styleText } from "node:util";

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
	console.error(styleText("red", `Error: ${error.message}`));
}
