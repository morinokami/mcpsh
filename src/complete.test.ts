import { describe, expect, test } from "vitest";

import { complete } from "./complete.ts";
import { Method } from "./constants.ts";
import { capabilities, schema } from "./fixtures.ts";

describe("complete", () => {
	describe("no capabilities", () => {
		test.each([
			[
				"",
				[
					Method.ping,
					Method.cancelledNotification,
					Method.progressNotification,
					Method.initializedNotification,
					Method.rootsListChangedNotification,
				],
			],
			["p", [Method.ping]],
			[" p", [Method.ping]],
			["ping", [Method.ping]],
			["ping ", []],
			[
				"no",
				[
					Method.cancelledNotification,
					Method.progressNotification,
					Method.initializedNotification,
					Method.rootsListChangedNotification,
				],
			],
			[
				"notifications/",
				[
					Method.cancelledNotification,
					Method.progressNotification,
					Method.initializedNotification,
					Method.rootsListChangedNotification,
				],
			],
			["notifications/p", [Method.progressNotification]],
			["notifications/progress", [Method.progressNotification]],
			["unknown", []],
		])('"%s" => [%s]', (line, expected) => {
			const result = complete(line, {}, {});

			expect(result).toEqual([expected, line]);
		});
	});

	describe.todo("with capabilities", () => {
		test.each([
			// method completion
			[
				"",
				[
					Method.ping,
					Method.listPrompts,
					Method.getPrompt,
					Method.listTools,
					Method.callTool,
					Method.cancelledNotification,
					Method.progressNotification,
					Method.initializedNotification,
					Method.rootsListChangedNotification,
				],
			],
			["p", [Method.ping, Method.listPrompts, Method.getPrompt]],
			[" p", [Method.ping, Method.listPrompts, Method.getPrompt]],
			["ping", [Method.ping]],
			["ping ", []],
			[
				"no",
				[
					Method.cancelledNotification,
					Method.progressNotification,
					Method.initializedNotification,
					Method.rootsListChangedNotification,
				],
			],
			[
				"notifications/",
				[
					Method.cancelledNotification,
					Method.progressNotification,
					Method.initializedNotification,
					Method.rootsListChangedNotification,
				],
			],
			["notifications/p", [Method.progressNotification]],
			["notifications/progress", [Method.progressNotification]],
			["unknown", []],
			// TODO: params completion
			[
				"prompts/get ",
				[
					// prompts/get {"name": "simple_prompt"}
					// prompts/get {"name": "complex_prompt", "arguments": {"temperature": "1"}}
					// prompts/get {"name": "complex_prompt", "arguments": {"temperature": "1", "style": "short"}}
				],
			],
		])('"%s" => [%s]', (line, expected) => {
			const result = complete(line, capabilities, schema);

			expect(result).toEqual([expected, line]);
		});
	});

	describe.todo("full capabilities");
});
