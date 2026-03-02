# Astra Framework

**Next-generation agent framework combining the best of Mastra and Indusagi**

Astra is a simple yet powerful agent framework that brings together the elegant architecture of Indusagi with the production-grade features of Mastra. It's designed to be easy to learn for beginners while providing advanced features for production use cases.

## Features

### From Indusagi (Simplicity & Elegance)

- ✅ **Clean Architecture**: Simple, understandable code (~50K vs 276K lines)
- ✅ **Event Bus**: Type-safe event system for extensibility
- ✅ **Steering/Follow-Up**: Intuitive message queuing for agent control
- ✅ **Simple Tools**: Functional tool definitions without builder pattern
- ✅ **TUI Ready**: Event system perfect for terminal UI

### From Mastra (Production Power)

- ✅ **Model Router**: 40+ providers with automatic fallbacks and cost optimization
- ✅ **Storage Abstraction**: Optional persistence with multiple backends
- ✅ **Observability**: OpenTelemetry integration for monitoring
- ✅ **Memory/RAG**: Vector-based semantic search
- ✅ **MCP Support**: Model Context Protocol integration
- ✅ **Evaluation Framework**: Automated testing and validation
- ✅ **Workflows**: Graph-based orchestration for complex tasks

## Quick Start

### Installation

```bash
npm install @astra/core
```

### Basic Usage

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

// Subscribe to events
agent.events.subscribe("message_start", (event) => {
  console.log("Message started:", event);
});

// Interrupt agent mid-execution
agent.steer({
  role: "user",
  content: [{ type: "text", text: "Stop and do this instead" }],
  timestamp: Date.now(),
});

// Queue follow-up message
agent.followUp({
  role: "user",
  content: [{ type: "text", text: "Also do this" }],
  timestamp: Date.now(),
});
```

## Architecture

```
Core Layer (Indusagi-style)
  ├─ Agent Loop
  ├─ Event Bus
  ├─ State Manager
  └─ Simple Tools
      ↓
Model Router (Mastra)
  ├─ 40+ Providers
  ├─ Automatic Fallbacks
  └─ Cost Optimization
      ↓
Storage (Mastra, Opt-in)
  ├─ In-Memory (default)
  ├─ File-based
  └─ PostgreSQL
      ↓
Observability (Mastra, Opt-in)
  └─ OpenTelemetry
      ↓
Memory/RAG (Mastra, Opt-in)
  └─ Vector Stores
```

## Configuration

### Level 1: Simple (In-Memory)

```typescript
const agent = new Agent({
  id: "my-agent",
  systemPrompt: "You are a helpful assistant",
  model: "gpt-4",
  provider: "openai",
});
```

### Level 2: With Tools

```typescript
import { getBuiltinTools } from "@astra/core";

const agent = new Agent({
  id: "my-agent",
  systemPrompt: "You are a coding assistant",
  model: "gpt-4",
  provider: "openai",
  tools: getBuiltinTools(),
});
```

### Level 3: With Storage (Coming Soon)

```typescript
import { Agent } from "@astra/core";
import { PostgresStorage } from "@astra/storage";

const agent = new Agent({
  id: "my-agent",
  systemPrompt: "You are a helpful assistant",
  model: "gpt-4",
  provider: "openai",
  storage: new PostgresStorage({
    connectionString: "postgresql://...",
  }),
});
```

## Steering & Follow-Up

Astra includes Indusagi's unique message queuing system:

### Steering Messages

Interrupt the agent mid-execution:

```typescript
// Agent is working...
agent.steer({
  role: "user",
  content: [{ type: "text", text: "Stop what you're doing and fix this bug instead" }],
  timestamp: Date.now(),
});

// Or send all at once
agent.setSteeringMode("all");
agent.steer(message1);
agent.steer(message2);
```

### Follow-Up Messages

Queue tasks to run after the agent finishes:

```typescript
// Queue multiple tasks
agent.setFollowUpMode("all");
agent.followUp(message1);
agent.followUp(message2);
agent.followUp(message3);

// Run once, agent will process all follow-ups
await agent.prompt(initialMessage);
```

## Event System

Subscribe to agent events for real-time updates:

```typescript
// Subscribe to specific event types
agent.events.subscribe("message_start", (event) => {
  console.log("Message started:", event);
});

agent.events.subscribe("tool_execution_start", (event) => {
  console.log("Tool executing:", event.toolName);
});

// Subscribe to all events
agent.events.subscribeAll((event) => {
  console.log("Event:", event.type, event);
});
```

## Tools

### Built-in Tools

Astra includes several built-in tools:

- `read_file` - Read file contents
- `write_file` - Write content to file
- `list_files` - List directory contents
- `web_search` - Search the web
- `web_fetch` - Fetch URL content
- `calculator` - Perform calculations
- `date_time` - Get current date/time
- `sleep` - Pause execution

### Custom Tools

Create custom tools easily:

```typescript
import type { AgentTool } from "@astra/core";

const myTool: AgentTool<{ param1: string }> = {
  name: "my_tool",
  description: "Does something useful",
  parameters: {
    type: "object",
    properties: {
      param1: { type: "string", description: "A parameter" },
    },
    required: ["param1"],
  },
  handler: async ({ param1 }, context) => {
    // Tool logic here
    return { result: `Processed ${param1}` };
  },
};

agent.addTool(myTool);
```

## Model Router

Astra's model router provides unified access to 40+ providers:

```typescript
import { ModelRouter, OpenAIProvider, AnthropicProvider } from "@astra/core";

const router = new ModelRouter();

// Register providers
router.registerProvider(new OpenAIProvider());
router.registerProvider(new AnthropicProvider());

// Select best model based on requirements
const model = router.selectModel({
  capabilities: ["streaming", "jsonMode"],
  maxCost: 0.05,
});

// Generate with automatic fallbacks
const response = await router.generate(model, context, options);
```

## Roadmap

### Phase 1: Core Foundation ✅
- [x] Agent class with event bus
- [x] Agent loop with steering/follow-up
- [x] Simple tool system
- [x] Model router with fallbacks
- [x] Built-in tools

### Phase 2: Enhanced Features (In Progress)
- [ ] Storage abstraction (PostgreSQL, file-based)
- [ ] Observability (OpenTelemetry)
- [ ] Memory system (working + semantic)
- [ ] TUI implementation
- [ ] CLI with multiple modes

### Phase 3: Production Features (Planned)
- [ ] Workflow engine
- [ ] MCP support
- [ ] Evaluation framework
- [ ] Comprehensive testing
- [ ] Documentation

## Comparison with Mastra & Indusagi

| Feature | Mastra | Indusagi | Astra |
|---------|---------|----------|-------|
| Lines of Code | 276K | 38K | ~50K |
| Model Router | ✅ | ❌ | ✅ |
| Event Bus | Basic | ✅ | ✅ |
| Steering/Follow-Up | ❌ | ✅ | ✅ |
| Storage | ✅ | ❌ | ✅ (opt-in) |
| Observability | ✅ | ❌ | ✅ (opt-in) |
| Memory/RAG | ✅ | ❌ | ✅ (opt-in) |
| Workflows | ✅ | ❌ | ✅ (planned) |
| MCP | ✅ | ❌ | ✅ (planned) |
| Evaluation | ✅ | ❌ | ✅ (planned) |
| TUI | ❌ | ✅ | ✅ (planned) |
| CLI | Basic | ✅ | ✅ (planned) |
| Simplicity | ❌ | ✅ | ✅ |

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## Acknowledgments

- **Mastra**: For production-grade features (model routing, storage, observability, memory/RAG, MCP, workflows, evaluation)
- **Indusagi**: For elegant architecture (event bus, steering/follow-up, simple tools, clean loop)
