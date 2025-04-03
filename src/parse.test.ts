import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { parseQuery } from "./parse.ts";

describe("parseQuery", () => {
	test("should parse a method-only query", () => {
		const query = "ping";

		const result = parseQuery(query);

		assert.deepEqual(result, { method: "ping" });
	});

	test("should parse a method with slashes", () => {
		const query = "resources/templates/list";

		const result = parseQuery(query);

		assert.deepEqual(result, { method: "resources/templates/list" });
	});

	test("should parse a method with params", () => {
		const query = 'prompts/get {"name": "simple_prompt", "arguments": {}}';

		const result = parseQuery(query);

		assert.deepEqual(result, {
			method: "prompts/get",
			params: {
				name: "simple_prompt",
				arguments: {},
			},
		});
	});

	test("should parse a method with complex nested params", () => {
		const query =
			'tools/call {"name": "echo", "arguments": {"message": "test"}}';

		const result = parseQuery(query);

		assert.deepEqual(result, {
			method: "tools/call",
			params: {
				name: "echo",
				arguments: {
					message: "test",
				},
			},
		});
	});

	test("should handle whitespace correctly", () => {
		const query = '  prompts/get   {"name":"simple_prompt"}  ';

		const result = parseQuery(query);

		assert.deepEqual(result, {
			method: "prompts/get",
			params: { name: "simple_prompt" },
		});
	});

	test("should throw error for invalid JSON params", () => {
		const query = "invalid {not valid json}";

		assert.throws(() => {
			parseQuery(query);
		}, /Invalid JSON format/);
	});

	test("should throw error for non-object params", () => {
		const query = "invalid [1, 2, 3]";

		assert.throws(() => {
			parseQuery(query);
		}, /Invalid params/);
	});
});
