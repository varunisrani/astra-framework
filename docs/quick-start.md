# Astra Framework - Quick Start Guide

Get up and running with Astra in 5 minutes.

## Installation

```bash
npm install @astra/core
```

## Your First Agent

```typescript
import { Agent, getBuiltinTools } from "@astra/core";

const agent = new Agent({
  id: "my-agent",
  systemPrompt: "You are a helpful assistant",
  model: "gpt-4",
  provider: "openai",
  tools: getBuiltinTools(),
});

// Send a prompt
const response = await agent.promptText("Hello, world!");

console.log(response);
```

## Using Built-in Tools

```typescript
import { Agent } from "@astra/core";
import { readFileTool, writeFileTool, listFilesTool } from "@astra/core/tools";

const agent = new Agent({
  id: "file-agent",
  systemPrompt: "You are a file operations assistant",
  tools: [readFileTool, writeFileTool, listFilesTool],
});

// Read a file
const response = await agent.promptText("Read package.json");

console.log(response);
```

## Creating Custom Tools

```typescript
import { Agent, getBuiltinTools } from "@astra/core";

const myTool = {
  name: "my_custom_tool",
  description: "Does something useful",
  parameters: {
    type: "object",
    properties: {
      input: { type: "string" },
    },
  } as any,
  handler: async ({ input }) => {
    return `Processed: ${input}`;
  },
};

const agent = new Agent({
  id: "custom-agent",
  tools: [myTool, ...getBuiltinTools()],
});

await agent.promptText("Use my tool");
```

## Event Subscriptions

```typescript
const agent = new Agent({
  id: "event-agent",
  tools: getBuiltinTools(),
});

// Subscribe to message start
agent.events.subscribe("message_start", (event) => {
  console.log("Message started at:", new Date(event.timestamp));
});

// Subscribe to tool execution
agent.events.subscribe("tool_execution_start", (event) => {
  console.log(`Tool started: ${event.toolName}`);
});

// Subscribe to agent completion
agent.events.subscribe("agent_end", (event) => {
  console.log("Agent completed with", event.messages.length, "messages");
});
```

## Using Storage

```typescript
import { Agent, createStorage } from "@astra/core";

// Create file-based storage
const storage = createStorage({
  type: "file",
  basePath: "./.astra/storage",
});

const agent = new Agent({
  id: "persisted-agent",
  storage,
});

// Agent state will be persisted
await agent.promptText("This message will be saved");

// Later sessions can load the state
// const loadedState = await storage.loadState("persisted-agent");
```

## Workflows

```typescript
import { Agent, Workflow, createWorkflow, createStep } from "@astra/core";

const agent = new Agent({
  id: "workflow-agent",
  tools: getBuiltinTools(),
});

// Create workflow steps
const step1 = createStep({
  id: "analyze",
  name: "Analyze input",
  execute: async (input, context) => {
    return { analysis: "Analyzed: " + input };
  },
});

const step2 = createStep({
  id: "process",
  name: "Process data",
  execute: async (input, context) => {
    return { processed: input.step1.analysis };
  },
});

// Create workflow
const workflow = createWorkflow({
  id: "analysis-workflow",
  name: "Data Analysis Workflow",
  steps: [step1, step2],
});

// Add sequential transition
workflow.then("analyze", "process");

// Execute workflow
const result = await workflow.execute({ input: "Analyze this data" });

console.log(result);
```

## Evaluation

```typescript
import { Agent, createEvaluationRunner, AccuracyEvaluator } from "@astra/core";

const agent = new Agent({
  id: "test-agent",
  tools: getBuiltinTools(),
});

// Create evaluation runner
const runner = createEvaluationRunner({
  dataset: [
    { id: "test1", input: "2+2", expected: "4" },
    { id: "test2", input: "3+3", expected: "6" },
    { id: "test3", input: "5+5", expected: "10" },
  ],
  evaluators: [new AccuracyEvaluator()],
});

// Run evaluation
const report = await runner.run();

console.log(report.generateReport(report));
```

## CLI Usage

### Interactive Mode

```bash
astra interactive
```

### Print Mode

```bash
astra print "Hello, world!"
```

### JSON Mode

```bash
astra json "Generate code"
```

### With Custom Model

```bash
astra interactive --model gpt-4-turbo --provider openai
```

## Advanced Configuration

### Model Routing

```typescript
import { Agent, ModelRouter, OpenAIProvider, AnthropicProvider } from "@astra/core";

// Create router
const router = new ModelRouter();
router.registerProvider(new OpenAIProvider());
router.registerProvider(new AnthropicProvider());

// Select model based on requirements
const model = router.selectModel({
  capabilities: ["streaming", "jsonMode"],
  maxCost: 0.03,
});

const agent = new Agent({
  id: "routing-agent",
  model: model.id,
  provider: model.provider,
});
```

### Observability

```typescript
import { Agent, logger, SimpleSpan, observability } from "@astra/core";

const agent = new Agent({
  observability,
});

// Spans and metrics will be tracked automatically
```

### Memory Management

```typescript
import { Agent, WorkingMemory, memoryManager } from "@astra/core";

const agent = new Agent({
  memory: memoryManager,
});

// Context will be pruned and prioritized automatically
```

## Next Steps

1. [x] Installation
2. [ ] First Agent
3. [ ] Custom Tools
4. [ ] Storage
5. [ ] Workflows
6. [ ] Evaluation

For more examples, see [examples](#examples) and [api](#api) documentation.
