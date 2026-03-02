# Astra Framework Examples

## Table of Contents

- [Basic Agent](#basic-agent)
- [Custom Tools](#custom-tools)
- [Events](#events)
- [Storage](#storage)
- [Observability](#observability)
- [Memory](#memory)
- [Workflows](#workflows)
- [Evaluation](#evaluation)

---

## Basic Agent

### Simple Prompt and Response

```typescript
import { Agent } from "@astra/core";

const agent = new Agent({
  id: "simple-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

const response = await agent.promptText("Hello, world!");

console.log(response);
```

### Multi-turn Conversation

```typescript
import { Agent } from "@astra/core";

const agent = new Agent({
  id: "chat-agent",
  systemPrompt: "You are a conversational AI assistant.",
  model: "gpt-4",
  provider: "openai",
});

// Turn 1
let response1 = await agent.promptText("What is 2 + 2?");
console.log("Response 1:", response1);

// Turn 2
let response2 = await agent.promptText("What about 3 * 3?");
console.log("Response 2:", response2);
```

---

## Custom Tools

### File Operations Tool

```typescript
import { Agent, AgentTool } from "@astra/core";
import * as fs from "fs/promises";

const fileStatsTool: AgentTool<{ path: string }> = {
  name: "file_stats",
  description: "Get file statistics (size, modified time, etc.)",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string" },
    },
  },
  handler: async ({ path }) => {
    const stats = await fs.stat(path);

    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
    };
  },
};

const agent = new Agent({
  id: "file-agent",
  systemPrompt: "You are a file operations assistant.",
  model: "gpt-4",
  provider: "openai",
  tools: [fileStatsTool],
});

const result = await agent.promptText("Get stats for package.json");
console.log(result);
```

### HTTP Request Tool

```typescript
import { Agent, AgentTool } from "@astra/core";
import type { ToolContext } from "@astra/core";

const httpRequestTool: AgentTool<{
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: string;
}> = {
  name: "http_request",
  description: "Make HTTP requests",
  parameters: {
    type: "object",
    properties: {
      url: { type: "string" },
      method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE"] },
      body: { type: "string" },
    },
    required: ["url", "method"],
  },
  handler: async ({ url, method, body }, context) => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify({ body }) : undefined,
      });

      const data = await response.json();

      return {
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      throw new Error(`HTTP request failed: ${error}`);
    }
  },
};

const agent = new Agent({
  id: "http-agent",
  systemPrompt: "You are a web assistant. Make HTTP requests when needed.",
  model: "gpt-4",
  provider: "openai",
  tools: [httpRequestTool],
});

const result = await agent.promptText("GET https://api.example.com/data");
console.log(result);
```

---

## Events

### Subscribing to Agent Events

```typescript
import { Agent } from "@astra/core";

const agent = new Agent({
  id: "event-agent",
  systemPrompt: "You are an agent.",
  model: "gpt-4",
  provider: "openai",
});

// Subscribe to message start
agent.events.subscribe("message_start", (event) => {
  console.log("📝 Message started:", event);
});

// Subscribe to tool execution
agent.events.subscribe("tool_execution_start", (event) => {
  console.log("🔧 Tool executing:", event.toolName);
});

agent.events.subscribe("tool_execution_end", (event) => {
  console.log("✅ Tool completed:", event.toolName, `duration: ${event.duration}ms`);
});

// Subscribe to agent completion
agent.events.subscribe("agent_end", (event) => {
  console.log("🏁 Agent completed with", event.messages.length, "messages");
});

// Now prompt the agent
await agent.promptText("Hello!");
```

### Custom Event Listener

```typescript
import { Agent } from "@astra/core";

const agent = new Agent({
  id: "custom-event-agent",
  systemPrompt: "You are an agent.",
  model: "gpt-4",
  provider: "openai",
});

let messageCount = 0;

const unsubscribe = agent.events.subscribe("message_end", (event) => {
  messageCount++;

  console.log(`Message #${messageCount}:`, event.message);

  if (messageCount >= 10) {
    console.log("Unsubscribing after 10 messages");
    unsubscribe();
  }
});

await agent.promptText("Tell me about AI frameworks.");
```

---

## Storage

### Persistent Agent with File Storage

```typescript
import { Agent, createStorage } from "@astra/core";

// Create file-based storage
const storage = createStorage({
  type: "file",
  basePath: "./.astra/storage",
});

const agent = new Agent({
  id: "persisted-agent",
  systemPrompt: "You are a helpful assistant with memory.",
  model: "gpt-4",
  provider: "openai",
  storage,
});

// Conversation 1
await agent.promptText("My name is Alice and I like cats");

// Create new agent instance and load previous state
const agent2 = new Agent({
  id: "persisted-agent",
  systemPrompt: "You are a helpful assistant with memory.",
  model: "gpt-4",
  provider: "openai",
  storage,
});

// Previous state should be loaded
await agent2.promptText("What's my name?");
```

### In-Memory Agent (No Persistence)

```typescript
import { Agent } from "@astra/core";

const agent = new Agent({
  id: "ephemeral-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

await agent.promptText("This state won't be saved");
```

---

## Observability

### Logging with Structured Logger

```typescript
import { Agent, logger } from "@astra/core";

const agent = new Agent({
  id: "logging-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

// Agent will now log structured events
await agent.promptText("Hello with logging!");
```

### Custom Span Tracking

```typescript
import { Agent, observability } from "@astra/core";

const agent = new Agent({
  id: "tracing-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
  observability,
});

// Start a span
const span = observability.startSpan("my_operation");

// Do work...
await agent.promptText("Trace this operation");

// End span
observability.endSpan("my_operation");

console.log(`Operation duration: ${span.getDuration()}ms`);
```

### Metrics Collection

```typescript
import { Agent, metrics } from "@astra/core";

const agent = new Agent({
  id: "metrics-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

metrics.incrementAgentStart();

try {
  await agent.promptText("Count this operation");
  metrics.addTokens(100);
  metrics.addCost(0.002);
} finally {
  console.log("Metrics:", metrics.getFormatted());
}
```

---

## Memory

### Context Pruning with Working Memory

```typescript
import { Agent, WorkingMemory, MemoryManager } from "@astra/core";

const workingMemory = new WorkingMemory({
  maxTokens: 8000,
  maxMessages: 20,
});

const memoryManager = new MemoryManager({
  workingMemory,
});

const agent = new Agent({
  id: "memory-agent",
  systemPrompt: "You are a helpful assistant with context management.",
  model: "gpt-4",
  provider: "openai",
  memory: memoryManager,
});

// Agent will automatically prune context when needed
for (let i = 0; i < 50; i++) {
  await agent.promptText(`Message ${i + 1}`);
}

console.log("Memory stats:", memoryManager.getStats());
```

---

## Workflows

### Sequential Workflow

```typescript
import { Agent, Workflow, createWorkflow, createStep } from "@astra/core";

const agent = new Agent({
  id: "workflow-agent",
  systemPrompt: "You are a workflow agent.",
  model: "gpt-4",
  provider: "openai",
});

// Define workflow steps
const analyzeStep = createStep({
  id: "analyze",
  name: "Analyze Input",
  execute: async (input, context) => {
    console.log("Analyzing:", input);
    return { analysis: `Analyzed: ${input}` };
  },
});

const processStep = createStep({
  id: "process",
  name: "Process Data",
  execute: async (input, context) => {
    console.log("Processing:", input.step1.analysis);
    return { processed: `Processed: ${input.step1.analysis}` };
  },
});

// Create workflow with sequential execution
const workflow = createWorkflow({
  id: "sequential-workflow",
  name: "Sequential Data Processing",
  steps: [analyzeStep, processStep],
});

workflow.then("analyze", "process");

// Execute workflow
const result = await workflow.execute({ input: "Sample data" });

console.log("Workflow result:", result);
```

### Parallel Workflow

```typescript
import { Workflow, createWorkflow, createStep } from "@astra/core";

const step1 = createStep({
  id: "step1",
  name: "Step 1",
  execute: async (input, context) => {
    return { result1: `${input} (step 1)` };
  },
});

const step2 = createStep({
  id: "step2",
  name: "Step 2",
  execute: async (input, context) => {
    return { result2: `${input} (step 2)` };
  },
});

const step3 = createStep({
  id: "step3",
  name: "Step 3",
  execute: async (input, context) => {
    return { result3: `${input} (step 3)` };
  },
});

const workflow = createWorkflow({
  id: "parallel-workflow",
  name: "Parallel Execution",
  steps: [step1, step2, step3],
});

// Execute steps 2 and 3 in parallel after step 1
workflow.parallel("step1", ["step2", "step3"]);

const result = await workflow.execute({ input: "data" });

console.log("Parallel workflow result:", result);
```

### Branching Workflow

```typescript
import { Workflow, createWorkflow, createStep } from "@astra/core";

const agent = new Agent({
  id: "branch-agent",
  systemPrompt: "You are a workflow agent.",
  model: "gpt-4",
  provider: "openai",
});

const yesStep = createStep({
  id: "yes",
  name: "Process with Yes",
  execute: async (input, context) => {
    return { result: `${input} (YES)` };
  },
});

const noStep = createStep({
  id: "no",
  name: "Process with No",
  execute: async (input, context) => {
    return { result: `${input} (NO)` };
  },
});

const workflow = createWorkflow({
  id: "branching-workflow",
  name: "Conditional Processing",
  steps: [yesStep, noStep],
});

// Branch based on condition
workflow.branch("decision", (context) => {
  // If score > 0.5, go to yes step
  return context.state?.score > 0.5;
}, "yes", "no");

const result = await workflow.execute({ input: "test data" });

console.log("Branching result:", result);
```

---

## Evaluation

### Simple Accuracy Evaluation

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
  {
    id: "test1",
    input: "What is 2 + 2?",
    expected: "4",
  },
  {
    id: "test2",
    input: "What is 3 * 3?",
    expected: "9",
  },
  {
    id: "test3",
    input: "What is 5 + 5?",
    expected: "10",
  },
]);

// Create evaluation runner
const runner = createEvaluationRunner({
  dataset: datasetManager.getAll(),
  evaluators: [new AccuracyEvaluator()],
  parallel: false,
});

// Run evaluation
const report = await runner.run();

console.log(report.generateReport(report));
```

### Multiple Evaluators

```typescript
import { Agent, createEvaluationRunner, AccuracyEvaluator, ContainsEvaluator, LengthEvaluator } from "@astra/core";

const agent = new Agent({
  id: "test-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
});

datasetManager.load([
  { id: "test1", input: "Hello", expected: "Hello" },
  { id: "test2", input: "123", expected: "123" },
  { id: "test3", input: "long text", expected: "short text" },
]);

const runner = createEvaluationRunner({
  dataset: datasetManager.getAll(),
  evaluators: [
    new AccuracyEvaluator(),
    new ContainsEvaluator(),
    new LengthEvaluator({ minLength: 3, maxLength: 100 }),
  ],
  parallel: true,
});

const report = await runner.run();

console.log("Average score:", report.averageScore);
console.log("Passed:", report.passedItems, "/", report.totalItems);
```

---

## CLI Integration

### Using Agent in Node.js Script

```typescript
#!/usr/bin/env node

import { Agent, getBuiltinTools } from "@astra/core";

const agent = new Agent({
  id: "script-agent",
  systemPrompt: "You are a helpful assistant.",
  model: "gpt-4",
  provider: "openai",
  tools: getBuiltinTools(),
});

const userInput = process.argv[2] || "Hello";

agent.promptText(userInput)
  .then((response) => {
    const text = response
      .filter((m) => m.role === "assistant")
      .flatMap((m) => m.content)
      .filter((c) => c.type === "text")
      .map((c: any) => c.text)
      .join("");

    console.log(text);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
```

Save as `script.js` and run:
```bash
node script.js "Your message"
```
