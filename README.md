# mcpsh

A minimal CLI client for the [Model Context Protocol](https://modelcontextprotocol.io/).

## Usage

Run `mcpsh` to connect to an MCP server.
Currently, only the stdio transport is supported.

```sh
$ npx mcpsh path/to/server.js
Connected to example-servers/everything 1.0.0
```

Then an interactive shell will be opened and you can interact with the server.
Enter a `method` name to call and `params` to pass to the method in raw JSON format.

```sh
> ping
Request: {
  "method": "ping"
}
Response: {}
> prompts/list
Request: {
  "method": "prompts/list"
}
Response: {
  "prompts": [
    {
      "name": "simple_prompt",
      "description": "A prompt without arguments"
    },
    {
      "name": "complex_prompt",
      "description": "A prompt with arguments",
      "arguments": [
        {
          "name": "temperature",
          "description": "Temperature setting",
          "required": true
        },
        {
          "name": "style",
          "description": "Output style",
          "required": false
        }
      ]
    }
  ]
}
> prompts/get {"name": "simple_prompt", "arguments": {}}
Request: {
  "method": "prompts/get",
  "params": {
    "name": "simple_prompt",
    "arguments": {}
  }
}
Response: {
  "messages": [
    {
      "role": "user",
      "content": {
        "type": "text",
        "text": "This is a simple prompt without arguments."
      }
    }
  ]
}
> tools/call {"name": "echo", "arguments": {}}
Request: {
  "method": "tools/call",
  "params": {
    "name": "echo",
    "arguments": {}
  }
}
MCP error -32603: [
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": [
      "message"
    ],
    "message": "Required"
  }
]
```

Press `Tab` to see available methods.

```sh
> resources/[TAB]
resources/list            resources/read            resources/templates/list
```
