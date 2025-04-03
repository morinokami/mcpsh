import { z } from "zod";

/**
 * Parses a query string into an object containing method and optional params.
 *
 * @param query The query string to parse. The format should be "[method] ([params])".
 * @returns An object containing method and optional params.
 */
export function parseQuery(query: string) {
	// trim whitespace and find the first space
	const trimmedQuery = query.trim();
	const dividerIndex = trimmedQuery.indexOf(" ");
	// if there is no space, return the method
	if (dividerIndex === -1) {
		return { method: trimmedQuery };
	}

	const method = trimmedQuery.slice(0, dividerIndex).trim();
	const paramsString = trimmedQuery.slice(dividerIndex + 1).trim();

	try {
		// validate that the string can be parsed as JSON
		let parsedJson: unknown;
		try {
			parsedJson = JSON.parse(paramsString);
		} catch (_error) {
			throw new InvalidQueryError(`Invalid JSON format: ${paramsString}`);
		}

		// validate the structure with Zod
		const ParamsSchema = z.record(z.string(), z.unknown());
		const params = ParamsSchema.parse(parsedJson);
		return { method, params };
	} catch (error) {
		if (error instanceof InvalidQueryError) {
			throw error;
		}
		throw new InvalidQueryError(`Invalid params: ${paramsString}`);
	}
}

class InvalidQueryError extends Error {
	static {
		InvalidQueryError.prototype.name = "InvalidQueryError";
	}
}
