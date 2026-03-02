# Astra Framework Examples

## [Quick Start](quick-start.md)
Get your first agent running in minutes.

## [API Examples](api/index.md)
Detailed API documentation with examples.

## [Code Examples](index.md)
Comprehensive code examples for all features.

## Usage Patterns

### Basic Agent
```typescript
import { Agent } from "@astra/core";

const agent = new Agent({
  id: "my-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

const response = await agent.promptText("Hello, world!");
```

### Agent with Tools
```typescript
import { Agent, getBuiltinTools } from "@astra/core";

const agent = new Agent({
  id: "coding-agent",
  systemPrompt: "You are a coding assistant. Write clean, efficient code.",
  model: "gpt-4",
  provider: "openai",
  tools: getBuiltinTools(),
});

const response = await agent.promptText("Create a TypeScript function that sorts an array of numbers.");
```

### Event Subscriptions
```typescript
import { Agent } from "@astra/core";

const agent = new Agent({
  id: "event-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

// Subscribe to all events
agent.events.subscribeAll((event) => {
  console.log("[EVENT]", event.type, event);
});

// Subscribe to specific events
agent.events.subscribe("message_start", (event) => {
  console.log("Message started");
});

agent.events.subscribe("tool_execution_start", (event) => {
  console.log(`Tool: ${event.toolName}`);
});

await agent.promptText("Tell me about events");
```

### Storage
```typescript
import { Agent, createStorage } from "@astra/core";

const storage = createStorage({ type: "file", basePath: "./astra-storage" });

const agent = new Agent({
  id: "persisted-agent",
  systemPrompt: "You are a helpful assistant with memory.",
  model: "gpt-4",
  provider: "openai",
  storage,
});

// Agent state will be persisted
await agent.promptText("Remember: my favorite color is blue");
```

### Workflows
```typescript
import { Agent, createWorkflow, createStep } from "@astra/core";

const agent = new Agent({
  id: "workflow-agent",
  systemPrompt: "You are a data analysis assistant.",
  model: "gpt-4",
  provider: "openai",
});

// Define workflow steps
const step1 = createStep({
  id: "fetch",
  name: "Fetch Data",
  execute: async (input, context) => {
    console.log("Fetching data:", input);
    return { data: "sample data" };
  },
});

const step2 = createStep({
  id: "analyze",
  name: "Analyze Data",
  execute: async (input, context) => {
    console.log("Analyzing:", input.data);
    return { analysis: "Analyzed: " + input.data };
  },
});

// Create workflow
const workflow = createWorkflow({
  id: "data-pipeline",
  name: "Data Analysis Pipeline",
  steps: [step1, step2],
});

// Execute workflow
const result = await workflow.execute({ source: "api" });

console.log("Workflow result:", result);
```

### Evaluation
```typescript
import { Agent, createEvaluationRunner, AccuracyEvaluator, datasetManager } from "@astra/core";

const agent = new Agent({
  id: "test-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

// Define test dataset
datasetManager.load([
  { id: "test1", input: "2+2", expected: "4" },
  { id: "test2", input: "3*3", expected: "9" },
  { id: "test3", input: "5+5", expected: "10" },
]);

// Create evaluation runner
const runner = createEvaluationRunner({
  dataset: datasetManager.getAll(),
  evaluators: [new AccuracyEvaluator()],
  parallel: true,
});

// Run evaluation
const report = await runner.run();

console.log(report.generateReport(report));
```

### Observability
```typescript
import { Agent, logger, observability } from "@astra/core";

const agent = new Agent({
  id: "observed-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

// Agent will now emit observability events
await agent.promptText("Trace this operation");

logger.info("Agent operation completed");
console.log("Spans:", observability.getSpans());
console.log("Metrics:", metrics.getFormatted());
```

### MCP
```typescript
import { MCPServer, createMCPServer, readFileTool } from "@astra/core";

// Create MCP server
const server = createMCPServer({
  name: "my-agent-mcp",
  version: "1.0.0",
  capabilities: {
    tools: true,
    resources: false,
    prompts: false,
  },
});

// Register tools
server.registerTool(readFileTool);

// Handle MCP calls (would connect to MCP transport)
// For now, just log them
console.log("MCP Server:", server.getServerInfo());
```

### CLI

```bash
# Interactive mode
astra interactive --model gpt-4

# Print mode
astra print "Generate a REST API in Python" --model gpt-4

# JSON mode (machine-readable)
astra json "List all files in current directory" --model gpt-4

# List available tools
astra tools

# List available models
astra models
```

## Advanced Patterns

### Custom Model Provider

```typescript
import { Agent, ModelRouter, ProviderAdapter } from "@astra/core";

class MyCustomProvider implements ProviderAdapter {
  name = "custom";
  supportedModels = [
    {
      id: "custom-model-1",
      provider: "custom",
      displayName: "Custom Model 1",
      capabilities: {
        streaming: true,
        jsonMode: false,
      },
      pricing: { input: 0.001, output: 0.002 },
    },
  ];

  async generate(model, context, options) {
    // Your implementation
    return {
      role: "assistant",
      content: [{ type: "text", text: "Response from custom provider" }],
      timestamp: Date.now(),
    };
  }
}

const router = new ModelRouter();
router.registerProvider(new MyCustomProvider());

const agent = new Agent({
  id: "custom-provider-agent",
  model: "custom-model-1",
  provider: "custom",
});
```

### Multi-Agent System

```typescript
import { Agent } from "@astra/core";

const agents = new Map<string, Agent>();

agents.set("coder", new Agent({
  id: "coder",
  systemPrompt: "You are a coding expert. Write clean, efficient code with good documentation.",
  model: "gpt-4",
  provider: "openai",
}));

agents.set("researcher", new Agent({
  id: "researcher",
  systemPrompt: "You are a research expert. Provide thorough, well-researched information with citations.",
  model: "gpt-4",
  provider: "openai",
}));

agents.set("summarizer", new Agent({
  id: "summarizer",
  systemPrompt: "You are a summarization expert. Create concise summaries of long texts while preserving key information.",
  model: "gpt-4",
  provider: "openai",
}));

// Use different agents for different tasks
const codeResponse = await agents.get("coder")!.promptText("Write a React component");

const researchResponse = await agents.get("researcher")!.promptText("What is the latest research on AI?");

const summary = await agents.get("summarizer")!.promptText("Summarize: " + researchResponse);
```

### Error Handling

```typescript
import { Agent } from "@astra/core";

const agent = new Agent({
  id: "robust-agent",
  systemPrompt: "You are a helpful assistant. Handle errors gracefully and provide helpful error messages.",
  model: "gpt-4",
  provider: "openai",
});

try {
  const response = await agent.promptText("Do something that might fail");
  console.log("Success:", response);
} catch (error) {
  console.error("Agent error:", error);
  // Agent will emit error event
}

// Subscribe to error events
agent.events.subscribe("error", (event) => {
  console.error("[AGENT ERROR]", event.error);
});
```

## Best Practices

### 1. Always Use Events

Subscribe to agent events for logging, monitoring, and UI updates.

### 2. Use Storage for Long-Lived Agents

If your agent needs to maintain state across sessions, use file or PostgreSQL storage.

### 3. Leverage Working Memory

Use the memory system to manage context window and prioritize important information.

### 4. Use Workflows for Complex Tasks

For multi-step processes, use workflows instead of single prompts.

### 5. Test with Evaluation

Use the evaluation framework to validate your agent's outputs before deployment.

### 6. Enable Observability

Use the observability system to trace execution and collect metrics in production.

### 7. Use Model Routing

Let the model router select the best model based on requirements (cost, capabilities, etc.).

### 8. Handle Errors Gracefully

Always implement proper error handling and provide helpful error messages to users.

---

## More Examples

For more specific examples, see:
- [Quick Start Guide](quick-start.md)
- [API Documentation](api/index.md)
- [Individual topic examples](api/index.md#detailed-examples)
