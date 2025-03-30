import { z } from "zod";

export function parseQuery(query: string) {
	// query = [method] ([params])
	const trimmedQuery = query.trim();
	const dividerIndex = trimmedQuery.indexOf(" ");
	if (dividerIndex === -1) {
		return { method: trimmedQuery };
	}

	const method = trimmedQuery.slice(0, dividerIndex).trim();
	const paramsString = trimmedQuery.slice(dividerIndex + 1).trim();
	try {
		const ParamsSchema = z.record(z.string(), z.unknown());
		const params = ParamsSchema.parse(JSON.parse(paramsString));
		return { method, params };
	} catch (_error) {
		throw new Error(`Invalid params: ${paramsString}`);
	}
}
