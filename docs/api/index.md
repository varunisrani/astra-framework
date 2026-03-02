# Astra Framework API Documentation

## Table of Contents

- [Agent](#agent)
- [Events](#events)
- [Tools](#tools)
- [Models](#models)
- [Storage](#storage)
- [Observability](#observability)
- [Memory](#memory)
- [Workflows](#workflows)
- [MCP](#mcp)
- [Evaluation](#evaluation)

---

## Agent

### Agent Class

Main class for creating and running AI agents.

#### Constructor

```typescript
new Agent(config: AgentConfig)
```

**AgentConfig Options:**
- `id` (string, required) - Unique agent identifier
- `systemPrompt` (string) - System prompt for the agent
- `model` (string) - Model ID (e.g., "gpt-4")
- `provider` (string) - Provider name (e.g., "openai")
- `thinkingLevel` (ThinkingLevel) - Reasoning level ("off" | "minimal" | "low" | "medium" | "high")
- `tools` (AgentTool[]) - Array of tools available to the agent
- `initialMessages` (Message[]) - Initial conversation history
- `storage` (StorageBackend) - Optional storage backend
- `observability` (any) - Optional observability config
- `memory` (any) - Optional memory config
- `steeringMode` ("all" | "one-at-a-time") - How to deliver steering messages
- `followUpMode` ("all" | "one-at-a-time") - How to deliver follow-up messages

#### Methods

##### `prompt(message: Message | Message[]): Promise<Message[]>`

Send a prompt to the agent and await completion.

```typescript
const response = await agent.prompt({
  role: "user",
  content: [{ type: "text", text: "Hello, world!" }],
  timestamp: Date.now(),
});
```

##### `promptText(text: string): Promise<Message[]>`

Convenience method to send a text prompt.

```typescript
const response = await agent.promptText("Hello, world!");
```

##### `steer(message: Message): void`

Interrupt agent mid-execution with a steering message.

```typescript
agent.steer({
  role: "user",
  content: [{ type: "text", text: "Stop and do this instead" }],
  timestamp: Date.now(),
});
```

##### `followUp(message: Message): void`

Queue a message to be processed after agent finishes.

```typescript
agent.followUp({
  role: "user",
  content: [{ type: "text", text: "Also do this" }],
  timestamp: Date.now(),
});
```

##### `setSystemPrompt(prompt: string): void`

Update the agent's system prompt.

```typescript
agent.setSystemPrompt("You are now a coding assistant");
```

##### `setModel(model: string, provider?: string): void`

Update the model the agent uses.

```typescript
agent.setModel("gpt-4", "openai");
```

##### `setTools(tools: AgentTool[]): void`

Set the tools available to the agent.

```typescript
agent.setTools([readFileTool, writeFileTool]);
```

##### `addTool(tool: AgentTool): void`

Add a single tool to the agent.

```typescript
agent.addTool(myCustomTool);
```

##### `removeTool(toolName: string): void`

Remove a tool by name.

```typescript
agent.removeTool("read_file");
```

##### `on(eventType: string, listener: Function): () => void`

Subscribe to agent events.

```typescript
agent.on("message_start", (event) => {
  console.log("Message started:", event);
});
```

##### `abort(): void`

Abort current agent execution.

```typescript
agent.abort();
```

##### `reset(): void`

Reset agent state to initial values.

```typescript
agent.reset();
```

---

## Events

### EventBus

Event bus for subscribing to and emitting events.

#### Constructor

```typescript
new EventBus()
```

#### Methods

##### `subscribe<T>(eventType: string, listener: (event: T) => void): () => void`

Subscribe to an event type. Returns unsubscribe function.

```typescript
const unsubscribe = eventBus.subscribe("message_start", (event) => {
  console.log(event);
});

// Later...
unsubscribe();
```

##### `emit(event: AgentEvent): void`

Emit an event to all subscribers.

```typescript
eventBus.emit({
  type: "test_event",
  timestamp: Date.now(),
});
```

##### `subscribeAll(listener: (event: any) => void): () => void`

Subscribe to all events.

---

## Tools

### AgentTool Interface

Define a tool for the agent to use.

```typescript
interface AgentTool<T> {
  name: string;
  description: string;
  parameters: TSchema;
  handler: (args: T, context: ToolContext) => Promise<string | object>;
}
```

### Built-in Tools

#### `readFileTool`

Read file contents.

```typescript
import { readFileTool } from "@astra/tools";

const result = await readFileTool.handler({ path: "./file.txt" }, context);
```

#### `writeFileTool`

Write content to a file.

```typescript
import { writeFileTool } from "@astra/tools";

const result = await writeFileTool.handler(
  { path: "./file.txt", content: "Hello" },
  context
);
```

#### `listFilesTool`

List files and directories.

```typescript
import { listFilesTool } from "@astra/tools";

const result = await listFilesTool.handler({ path: "." }, context);
```

#### `webSearchTool`

Search the web.

```typescript
import { webSearchTool } from "@astra/tools";

const result = await webSearchTool.handler({ query: "AI frameworks" }, context);
```

#### `calculatorTool`

Perform calculations.

```typescript
import { calculatorTool } from "@astra/tools";

const result = await calculatorTool.handler({ expression: "2 + 2" }, context);
```

---

## Models

### ModelRouter

Router for selecting and using LLM models.

#### Methods

##### `registerProvider(adapter: ProviderAdapter): void`

Register a new provider.

```typescript
import { ModelRouter, OpenAIProvider } from "@astra/models";

const router = new ModelRouter();
router.registerProvider(new OpenAIProvider());
```

##### `selectModel(requirements: ModelRequirements): ModelConfig`

Select the best model based on requirements.

```typescript
const model = router.selectModel({
  capabilities: ["streaming", "jsonMode"],
  maxCost: 0.05,
});
```

##### `generate(model, context, options): Promise<any>`

Generate a response using automatic fallbacks.

```typescript
const response = await router.generate(model, context, options);
```

---

## Storage

### StorageBackends

#### `InMemoryStorage`

In-memory storage (default, no persistence).

```typescript
import { InMemoryStorage } from "@astra/storage";

const storage = new InMemoryStorage();
await storage.saveState("agent-1", state);
const loaded = await storage.loadState("agent-1");
```

#### `FileStorage`

File-based JSON storage.

```typescript
import { FileStorage } from "@astra/storage";

const storage = new FileStorage({ basePath: ".astra/storage" });
await storage.saveState("agent-1", state);
```

#### `PostgresStorage`

PostgreSQL storage for production (requires pg package).

```typescript
import { PostgresStorage } from "@astra/storage";

const storage = new PostgresStorage({
  connectionString: "postgresql://..."
});
```

---

## Observability

### Logger

Structured logger for debugging and monitoring.

```typescript
import { logger } from "@astra/observability";

logger.debug("Debug message");
logger.info("Info message");
logger.warn("Warning message");
logger.error("Error message", error);
```

### ObservabilityManager

Manager for tracking agent execution.

```typescript
import { observability } from "@astra/observability";

const span = observability.startSpan("agent_execution");
// ... do work ...
observability.endSpan("agent_execution");
```

### MetricsCollector

Collect metrics (agent starts, errors, tokens, cost).

```typescript
import { metrics } from "@astra/observability";

metrics.incrementAgentStart();
metrics.incrementToolCall();
metrics.addTokens(100);

const stats = metrics.getMetrics();
```

---

## Memory

### WorkingMemory

Context management with pruning and prioritization.

```typescript
import { WorkingMemory } from "@astra/memory";

const memory = new WorkingMemory({ maxTokens: 8000 });
const pruned = memory.prune(messages);
```

### MemoryManager

Coordinate memory operations.

```typescript
import { memoryManager } from "@astra/memory";

const processed = memoryManager.processMessages(messages);
const stats = memoryManager.getStats(messages);
```

---

## Workflows

### Workflow

Orchestrate complex multi-step processes.

#### Constructor

```typescript
new Workflow(config: WorkflowConfig)
```

#### Methods

##### `then(fromStepId: string, toStepId: string): this`

Add sequential transition.

```typescript
workflow.then("step1", "step2");
```

##### `parallel(fromStepId: string, toStepIds: string[]): this`

Add parallel transitions.

```typescript
workflow.parallel("step1", ["step2", "step3"]);
```

##### `branch(fromStepId, condition, trueStepId, falseStepId): this`

Add conditional branching.

```typescript
workflow.branch(
  "step1",
  (ctx) => ctx.score > 0.5,
  "step2",
  "step3"
);
```

##### `execute(initial?): Promise<WorkflowResult>`

Execute the workflow.

```typescript
const result = await workflow.execute({ initialValue: "hello" });
```

---

## MCP

### MCPServer

Expose tools and resources via MCP protocol.

```typescript
import { MCPServer, createMCPServer } from "@astra/mcp";

const server = createMCPServer({
  name: "my-server",
  version: "1.0.0",
  capabilities: { tools: true, resources: false },
});

server.registerTool(myTool);

// Handle incoming MCP calls...
```

### MCPClient

Connect to external MCP servers.

```typescript
import { MCPClient, createMCPClient } from "@astra/mcp";

const client = createMCPClient("stdio://some-server");

const tools = await client.listTools();
```

---

## Evaluation

### Evaluator

Base interface for creating custom evaluators.

```typescript
import { createEvaluator } from "@astra/evals";

const evaluator = createEvaluator({
  id: "custom",
  name: "Custom Evaluator",
  description: "My custom evaluation logic",
  evaluate: async (input) => {
    // ... evaluation logic ...
  }
});
```

### Built-in Evaluators

#### `AccuracyEvaluator`

Check exact match.

#### `ContainsEvaluator`

Check if expected value is in output.

#### `JSONStructureEvaluator`

Validate JSON structure.

#### `LengthEvaluator`

Check output length constraints.

### EvaluationRunner

Run evaluations against datasets.

```typescript
import { createEvaluationRunner, datasetManager } from "@astra/evals";

datasetManager.load([
  { id: "test1", input: "2+2", expected: "4" },
  { id: "test2", input: "3+3", expected: "6" },
]);

const runner = createEvaluationRunner({
  dataset: datasetManager.getAll(),
  evaluators: [new AccuracyEvaluator()],
  parallel: true,
});

const report = await runner.run();
console.log(report.generateReport(report));
```

---

## CLI

### CLI Modes

#### Interactive Mode

```bash
astra interactive --model gpt-4 --provider openai
```

#### Print Mode

```bash
astra print "Hello, world!" --model gpt-4
```

#### JSON Mode

```bash
astra json "Generate JSON" --model gpt-4
```

#### List Tools

```bash
astra tools
```

#### List Models

```bash
astra models
```
