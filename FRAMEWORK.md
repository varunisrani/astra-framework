# Agent Framework Analysis: Mastra vs Indusagi

**Analysis Date:** March 2, 2026
**Goal:** Build a next-generation agent framework combining the best of Mastra and Indusagi

---

## Executive Summary

### Framework Overview

**Mastra** is a comprehensive, production-ready AI framework designed for building enterprise-grade applications. It's a monorepo (276K+ lines of TypeScript) with extensive features including workflows, observability, storage, memory/RAG, model routing, MCP support, and human-in-the-loop capabilities.

**Indusagi** is a focused, elegant agent framework (38K+ lines) that prioritizes simplicity and extensibility. It provides a clean agent loop architecture with event-driven design, excellent TUI support, and a well-thought-out tool system.

**Indusagi-coding-agent** is a practical CLI implementation built on Indusagi, demonstrating real-world usage with file operations, web capabilities, and session management.

### Key Findings

| Aspect | Mastra | Indusagi |
|--------|--------|----------|
| **Architecture** | Monorepo, modular, production-first | Single-package, elegant, simplicity-first |
| **Lines of Code** | ~276K | ~38K |
| **Agent Model** | Workflow-based + Loop | Pure loop-based |
| **State Management** | Persistent storage + in-memory | In-memory with event bus |
| **Tool System** | Extensive with builder pattern | Simple but extensible |
| **Observability** | Built-in OpenTelemetry | Minimal telemetry |
| **Workflows** | Graph-based, powerful | None (loop-only) |
| **Memory/RAG** | Comprehensive with vector stores | Basic working memory |
| **Human-in-the-Loop** | Suspend/resume workflows | Steering/follow-up messages |
| **TUI Support** | None | Excellent (Blessed-like) |
| **CLI Tooling** | Basic create CLI | Full-featured coding agent |
| **Deployment** | Server adapters, deployers | CLI/RPC focused |

---

## 1. Mastra Framework Deep Dive

### 1.1 Architecture Overview

Mastra is a **monorepo** with the following structure:

```
mastra/
├── packages/
│   ├── core/              # Main package (agent, workflows, storage, etc.)
│   ├── memory/            # Memory and RAG implementations
│   ├── rag/               # RAG-specific features
│   ├── evals/             # Evaluation framework
│   ├── mcp/               # Model Context Protocol support
│   ├── agent-builder/     # Agent generation tools
│   └── server/            # HTTP server implementations
├── server-adapters/       # Hono, Express integrations
├── integrations/          # Third-party service integrations
├── stores/               # Storage backends
├── auth/                 # Authentication
└── observability/        # OpenTelemetry integration
```

### 1.2 Core Architecture Patterns

#### 1.2.1 Agent Execution Model

**Location:** `mastra/packages/core/src/agent/agent.ts` (4800+ lines)

Mastra supports **multiple execution models**:

1. **Legacy Agent**: Simple agent with direct model calls
2. **VNext Agent**: Modern agent with loop-based execution
3. **Workflow-based**: Graph-orchestrated multi-step processes
4. **Network-based**: Multi-agent collaboration

**Key Design Decision**: Mastra uses a `MastraBase` class that all components extend, providing:
- Uniform observability tracking
- Logging integration
- Error handling
- Resource identification

```typescript
// Mastra Agent API
class Agent<TId, TTools, TOutput> extends MastraBase {
  async generate(input, options): Promise<AgentResult>
  async stream(input, options): Promise<StreamResult>
  // Methods for evaluation, memory management, voice, etc.
}
```

**Strengths:**
- Multiple execution models for different use cases
- Comprehensive state management with persistent storage
- Built-in evaluation and observability
- Supports multi-agent networks

**Weaknesses:**
- High complexity (single agent file is 4800+ lines)
- Steep learning curve
- Over-engineering for simple use cases

#### 1.2.2 Loop Architecture

**Location:** `mastra/packages/core/src/loop/loop.ts`

Mastra's loop is **workflow-centric** with the following features:

1. **Workflow Integration**: Uses a graph-based workflow engine for complex orchestrations
2. **Processor Pipeline**: Pre/post-processing for inputs and outputs
3. **State Serialization**: Supports suspend/resume for human-in-the-loop
4. **Multi-model Support**: Model fallbacks and routing

**Key Implementation:**

```typescript
function loop<Tools extends ToolSet, OUTPUT>({
  models,           // Array of models for fallbacks
  tools,            // Tool set
  outputProcessors, // Pre/post processing
  resumeContext,    // For suspend/resume
  requireToolApproval, // Human approval needed
  // ...
}: LoopOptions<Tools, OUTPUT>) {
  // Returns a stream with workflow integration
}
```

**Strengths:**
- Production-ready with state persistence
- Human-in-the-loop built-in
- Supports model fallbacks
- Workflow orchestration for complex tasks

**Weaknesses:**
- Complex workflow DSL
- Overkill for simple agent use cases
- Tight coupling with storage layer

#### 1.2.3 Tool System

**Location:** `mastra/packages/core/src/tools/`

Mastra uses a **builder pattern** with extensive tool infrastructure:

```typescript
// Tool builder pattern
createTool({
  id: 'my-tool',
  description: '...',
  inputSchema: z.object({ /* ... */ }),
  execute: async ({ context }) => {
    // Tool execution
  }
})
```

**Tool Features:**
- Zod schema validation
- Type-safe tool definitions
- Tool approval workflow
- Tool streaming support
- UI integration hooks

**Strengths:**
- Type-safe with Zod
- Built-in validation
- Approval workflow
- Rich tool metadata

**Weaknesses:**
- More verbose than Indusagi
- Builder pattern adds complexity

#### 1.2.4 Model Routing

**Location:** `mastra/packages/core/src/llm/model/router.ts`

Mastra's **model router** is a standout feature:

- **40+ providers**: OpenAI, Anthropic, Google, Groq, Mistral, etc.
- **Unified interface**: Single API for all providers
- **Model fallbacks**: Automatic fallback on failure
- **Cost optimization**: Route to cheapest model that meets requirements
- **Feature-based routing**: Route based on required features (vision, streaming, etc.)

**Key Implementation:**

```typescript
class ModelRouterLanguageModel {
  constructor(models: MastraLanguageModel[])
  async doGenerate(options) {
    // Route to best model based on requirements
  }
}
```

**Strengths:**
- Excellent provider abstraction
- Automatic fallbacks
- Cost optimization
- Feature-aware routing

**Weaknesses:**
- Complex internal implementation
- Requires understanding of all provider differences

### 1.3 Key Features

#### 1.3.1 Workflows

**Location:** `mastra/packages/core/src/workflows/`

Mastra's workflow engine is **graph-based** with:

```typescript
const workflow = createWorkflow({
  id: 'my-workflow',
  steps: [
    createStep('step1', async () => { /* ... */ }),
    createStep('step2', async () => { /* ... */ })
  ]
})
  .then('step1', 'step2')
  .branch(condition, 'step2', 'step3')
  .parallel(['step3', 'step4'])
```

**Features:**
- Graph-based orchestration
- Suspend/resume for human input
- State persistence
- Error handling and retries
- Visual workflow builder (UI)

**Strengths:**
- Powerful for complex multi-step processes
- Built-in persistence
- Human-in-the-loop support
- Excellent for production workflows

**Weaknesses:**
- Complex DSL
- Overkill for simple agents
- Steep learning curve

#### 1.3.2 Storage & Persistence

**Location:** `mastra/packages/core/src/storage/`

Mastra provides **comprehensive storage**:

```typescript
// Storage domains
- Agents          // Agent configurations
- Workflows       // Workflow definitions
- MCP Servers     // MCP server definitions
- Scorers         // Evaluation scorers
// Plus multiple storage backends
```

**Storage Backends:**
- In-memory (for development)
- PostgreSQL
- SQLite
- Custom backends via interface

**Strengths:**
- Production-ready persistence
- Multiple backend options
- Type-safe storage domains
- Migration support

**Weaknesses:**
- Requires database setup
- More complexity than needed for simple apps

#### 1.3.3 Observability

**Location:** `mastra/packages/core/src/observability/`

Mastra has **built-in OpenTelemetry** integration:

- Automatic span generation for all operations
- Distributed tracing across agents/workflows
- Performance metrics
- Error tracking
- Integration with APM tools (DataDog, New Relic, etc.)

**Strengths:**
- Production-ready observability
- Open standards (OpenTelemetry)
- Deep visibility into agent execution
- Essential for debugging complex workflows

**Weaknesses:**
- Requires observability stack setup
- Overkill for small applications

#### 1.3.4 Memory & RAG

**Location:** `mastra/packages/core/src/memory/`

Mastra provides **comprehensive memory**:

```typescript
const memory = new Memory({
  vectorStore: new PgVectorStore(),
  embeddingModel: 'openai/text-embedding-3-small'
});

// Features:
- Conversation history
- Working memory (ephemeral context)
- Semantic recall (RAG)
- Vector-based retrieval
- Context window management
```

**Strengths:**
- Multiple memory types
- Vector-based semantic search
- Context window management
- Production-ready

**Weaknesses:**
- Requires vector database
- More complex than simple memory

#### 1.3.5 MCP Support

**Location:** `mastra/packages/core/src/mcp/`

Mastra has **first-class MCP support**:

- Expose agents/tools as MCP servers
- Consume other MCP servers
- MCP registry and discovery
- Standard protocol compliance

**Strengths:**
- Open protocol
- Ecosystem integration
- Tool sharing across agents
- Future-proof

**Weaknesses:**
- MCP ecosystem still emerging

#### 1.3.6 Evaluation Framework

**Location:** `mastra/packages/core/src/evals/`

Mastra includes an **evaluation framework**:

```typescript
// Define evaluators
const scorer = createScorer({
  id: 'accuracy',
  criteria: 'Check if answer is correct',
  evaluator: async ({ output, expected }) => {
    // Evaluate and score
  }
});

// Run evaluation
await agent.evaluate({
  evaluators: [scorer],
  dataset: testDataset
});
```

**Strengths:**
- Production testing
- Automated scoring
- Dataset support
- Integration with CI/CD

**Weaknesses:**
- Complex setup
- May be overkill for small projects

### 1.4 Code Quality Assessment

**Strengths:**
- Excellent TypeScript usage with strong typing
- Comprehensive test coverage (unit, integration, e2e)
- Good documentation (docs folder, inline comments)
- Production-ready error handling
- Modular architecture

**Weaknesses:**
- High complexity and learning curve
- Some files are very large (4800+ line agent file)
- Tight coupling between components
- Over-engineering for simple use cases

---

## 2. Indusagi Framework Deep Dive

### 2.1 Architecture Overview

Indusagi is a **single-package** framework with a clean, focused design:

```
indusagi/
├── src/
│   ├── agent/          # Core agent implementation
│   │   ├── agent.ts           # Agent class
│   │   ├── agent-loop.ts      # Loop implementation
│   │   ├── event-bus.ts       # Event-driven architecture
│   │   ├── state-manager.ts   # State management
│   │   ├── tools/             # Built-in tools
│   │   └── types.ts           # Type definitions
│   ├── ai/             # Model abstraction layer
│   └── tui/            # Terminal UI
```

**Design Philosophy:** Simplicity, elegance, extensibility

### 2.2 Core Architecture Patterns

#### 2.2.1 Agent Execution Model

**Location:** `indusagi/src/agent/agent.ts`

Indusagi uses a **pure loop-based agent** with event-driven architecture:

```typescript
class Agent {
  private state: AgentState;
  private eventBus: AgentEventBus;
  private stateManager: AgentStateManager;
  private steeringQueue: AgentMessage[] = [];
  private followUpQueue: AgentMessage[] = [];

  async prompt(message: AgentMessage): Promise<void> {
    await this._runLoop([message]);
  }

  steer(message: AgentMessage) {
    this.steeringQueue.push(message); // Interrupt mid-execution
  }

  followUp(message: AgentMessage) {
    this.followUpQueue.push(message); // Queue after completion
  }
}
```

**Key Design Patterns:**

1. **Event Bus**: All agent events are emitted to subscribers
2. **State Manager**: Centralized state mutation with type safety
3. **Queued Messaging**: Steering (interrupt) and follow-up (after completion) queues
4. **Transform Pipeline**: Context transformations before LLM calls

**Strengths:**
- Clean, understandable architecture (~500 lines for agent class)
- Event-driven for extensibility
- Flexible message queuing
- Simple to use and understand

**Weaknesses:**
- No persistent state by default
- Limited workflow capabilities
- No built-in observability

#### 2.2.2 Agent Loop

**Location:** `indusagi/src/agent/agent-loop.ts`

Indusagi's loop is **elegant and straightforward**:

```typescript
async function runLoop(
  currentContext: AgentContext,
  newMessages: AgentMessage[],
  config: AgentLoopConfig,
  signal: AbortSignal,
  stream: EventStream<AgentEvent, AgentMessage[]>,
  streamFn?: StreamFn
): Promise<void> {
  while (true) {
    // Process pending messages (steering/follow-up)
    if (pendingMessages.length > 0) {
      // Add to context
    }

    // Stream assistant response
    const message = await streamAssistantResponse(...);

    // Execute tool calls if any
    if (hasToolCalls) {
      await executeToolCalls(...);
    }

    // Check for more tool calls or steering messages
    // If none, check for follow-up messages
    // If none, exit loop
  }
}
```

**Key Features:**
1. **Dual Message Queues**: Steering (interrupt) and follow-up (after completion)
2. **Tool Execution**: Automatic tool calling with error handling
3. **Event Streaming**: Real-time events for UI updates
4. **Abort Support**: Graceful cancellation

**Strengths:**
- Simple and predictable
- Easy to debug
- Good separation of concerns
- Event-driven for real-time updates

**Weaknesses:**
- No workflow orchestration
- No state persistence
- Limited to simple loop execution

#### 2.2.3 Event Bus

**Location:** `indusagi/src/agent/event-bus.ts`

Indusagi's event bus is **simple yet powerful**:

```typescript
class AgentEventBus {
  private listeners: Map<EventType, Listener[]> = new Map();

  subscribe(fn: (event: AgentEvent) => void): () => void {
    // Subscribe and return unsubscribe function
  }

  emit(event: AgentEvent): void {
    // Emit to all listeners
  }
}
```

**Event Types:**
- `agent_start` / `agent_end`
- `turn_start` / `turn_end`
- `message_start` / `message_update` / `message_end`
- `tool_execution_start` / `tool_execution_end`
- Custom events via extension

**Strengths:**
- Simple API
- Type-safe events
- Easy to subscribe/unsubscribe
- Perfect for TUI updates

**Weaknesses:**
- No event filtering or batching
- No event persistence

#### 2.2.4 Tool System

**Location:** `indusagi/src/agent/tools/`

Indusagi's tools are **simple and functional**:

```typescript
interface AgentTool<T> {
  name: string;
  description: string;
  parameters: TSchema;
  handler: (args: T, context: ToolContext) => Promise<string | object>;
}

// Example tool
const readFile: AgentTool<{ path: string }> = {
  name: 'read_file',
  description: 'Read a file',
  parameters: { type: 'object', properties: { path: { type: 'string' } } },
  handler: async ({ path }, context) => {
    return fs.readFileSync(path, 'utf-8');
  }
};
```

**Built-in Tools:**
- `read`, `write`, `edit` - File operations
- `bash` - Shell execution
- `ls`, `find`, `grep` - File system navigation
- `websearch`, `webfetch` - Web capabilities
- `todo` - Task management

**Strengths:**
- Simple tool definition
- Type-safe with TypeBox
- Good set of built-in tools
- Easy to extend

**Weaknesses:**
- No tool approval workflow
- Limited tool metadata
- No UI integration hooks

#### 2.2.5 Model Abstraction

**Location:** `indusagi/src/ai/`

Indusagi's model abstraction is **clean and extensible**:

```typescript
interface Model<T> {
  provider: string;
  id: string;
  api: string;
  // ... model properties
}

function getModel(provider: string, model: string): Model<any> {
  // Factory for model instances
}

function streamSimple(
  model: Model<any>,
  context: Context,
  options: SimpleStreamOptions
): EventStream<AssistantEvent, AssistantMessage> {
  // Stream from any provider
}
```

**Supported Providers:**
- OpenAI
- Anthropic
- Google (Gemini)
- Mistral
- Groq
- Ollama (local)
- LM Studio (local)
- AWS Bedrock

**Strengths:**
- Clean abstraction
- Good provider coverage
- Local model support
- Simple API

**Weaknesses:**
- No model routing
- No automatic fallbacks
- Manual provider selection

### 2.3 Key Features

#### 2.3.1 Steering & Follow-Up Messages

**Location:** `indusagi/src/agent/agent.ts`

Indusagi's **unique message queuing** is elegant:

```typescript
// Steering: Interrupt agent mid-execution
agent.steer({
  role: 'user',
  content: [{ type: 'text', text: 'Stop what you are doing and do this instead' }]
});

// Follow-up: Queue message after agent finishes
agent.followUp({
  role: 'user',
  content: [{ type: 'text', text: 'Now also do this' }]
});

// Queue modes
agent.setSteeringMode('all');        // Send all at once
agent.setSteeringMode('one-at-a-time'); // Send one per turn
agent.setFollowUpMode('all');        // Send all at once
agent.setFollowUpMode('one-at-a-time'); // Send one per turn
```

**Use Cases:**
- **Steering**: User interrupts long-running agent execution
- **Follow-up**: Chain multiple tasks without manual prompting
- **Batching**: Queue multiple operations

**Strengths:**
- Intuitive API
- Flexible queue modes
- Perfect for interactive sessions
- No complex workflow DSL needed

**Weaknesses:**
- No visual representation
- No state persistence

#### 2.3.2 TUI (Terminal UI)

**Location:** `indusagi/src/tui/`

Indusagi has **excellent TUI support** (Blessed-like):

```typescript
const tui = new TUI({
  agent: myAgent,
  theme: 'dracula' // or custom theme
});

// Features:
- Real-time message streaming
- Markdown rendering with syntax highlighting
- Code blocks with language detection
- File attachments (images, PDFs, etc.)
- Interactive command palette
- Session tree navigation
- Multi-panel layout
```

**Strengths:**
- Beautiful and responsive
- Rich feature set
- Customizable themes
- Excellent interactive experience

**Weaknesses:**
- Terminal-only (no web UI in core)

#### 2.3.3 Transform Pipeline

**Location:** `indusagi/src/agent/agent.ts`

Indusagi's **context transformation** is flexible:

```typescript
const agent = new Agent({
  transformContext: async (messages: AgentMessage[], signal?: AbortSignal) => {
    // Prune old messages
    if (estimateTokens(messages) > MAX_TOKENS) {
      return pruneOldMessages(messages);
    }

    // Inject context from external sources
    const additionalContext = await fetchContext(signal);
    return [...messages, ...additionalContext];
  },

  convertToLlm: (messages: AgentMessage[]): Message[] => {
    // Convert AgentMessage[] to LLM-compatible Message[]
    return messages.filter(m => m.role === 'user' || m.role === 'assistant');
  }
});
```

**Strengths:**
- Flexible context manipulation
- Separation of concerns (transform vs convert)
- User control over context window
- External context injection

**Weaknesses:**
- No built-in pruning strategies
- No context window tracking

### 2.4 Code Quality Assessment

**Strengths:**
- Clean, readable code
- Simple architecture (38K vs 276K lines)
- Good TypeScript usage
- Easy to understand and extend
- Focused on core functionality

**Weaknesses:**
- Limited documentation
- Minimal test coverage
- No built-in observability
- No production-grade features (persistence, monitoring, etc.)

---

## 3. Indusagi-Coding-Agent Deep Dive

### 3.1 Overview

**Location:** `indusagi-coding-agent/`

A practical CLI implementation built on Indusagi framework.

### 3.2 Key Features

#### 3.2.1 CLI Interface

```bash
# Interactive mode
indusagi

# File-aware prompts
indusagi @src/index.ts "Summarize this file"

# Print mode for scripting
indusagi --print "Generate code"
indusagi --json "Generate JSON"

# RPC mode for process integration
indusagi --rpc
```

**Strengths:**
- Multiple modes for different use cases
- File-aware operations
- Scriptable via JSON output
- RPC for process integration

#### 3.2.2 Session Management

```typescript
// Session tree structure
sessions/
├── main/
│   ├── turn-1/
│   ├── turn-2/
│   └── turn-3/
└── branch-1/
    └── turn-1/
```

**Features:**
- Session compaction (merge turns)
- Tree navigation
- Branch management
- Resume from any point

**Strengths:**
- Good for iterative development
- Branch support for exploration
- Persistent across runs

**Weaknesses:**
- File-based only (no database)
- Limited collaboration features

#### 3.2.3 Hooks System

```typescript
// Hooks for extending functionality
hooks:
  beforePrompt: async (context) => { /* ... */ }
  afterPrompt: async (result) => { /* ... */ }
  beforeTool: async (tool, args) => { /* ... */ }
  afterTool: async (tool, args, result) => { /* ... */ }
```

**Strengths:**
- Extensible without modifying core
- Good for logging, monitoring, validation
- Simple API

**Weaknesses:**
- No async error handling guarantees
- Limited hook points

#### 3.2.4 Extensions

```typescript
// Extension system for adding features
extensions:
  - name: custom-tool
    tools: [myCustomTool]
  - name: custom-mode
    modes: [customMode]
```

**Strengths:**
- Modular design
- Easy to share extensions
- No modification of core code

**Weaknesses:**
- No extension marketplace
- Limited extension API

---

## 4. Comparative Analysis

### 4.1 Feature-by-Feature Comparison

| Feature | Mastra | Indusagi | Winner |
|---------|---------|-----------|--------|
| **Architecture** | Monorepo, modular | Single-package, focused | Indusagi (for simplicity) |
| **Code Size** | 276K+ lines | 38K+ lines | Indusagi |
| **Agent Loop** | Complex, workflow-integrated | Simple, elegant | Indusagi |
| **Tool System** | Builder pattern, type-safe | Simple, functional | Tie (both good) |
| **Model Routing** | Excellent (40+ providers, fallbacks) | Basic (manual selection) | **Mastra** |
| **Workflows** | Graph-based, powerful | None | **Mastra** |
| **State Persistence** | Database-backed | In-memory only | **Mastra** |
| **Observability** | OpenTelemetry, comprehensive | Minimal telemetry | **Mastra** |
| **Human-in-the-Loop** | Suspend/resume workflows | Steering/follow-up messages | Mastra (for persistence) |
| **Memory/RAG** | Comprehensive (vector stores) | Basic working memory | **Mastra** |
| **MCP Support** | First-class | None | **Mastra** |
| **Evaluation** | Built-in framework | None | **Mastra** |
| **TUI Support** | None | Excellent (Blessed-like) | **Indusagi** |
| **CLI Tooling** | Basic create CLI | Full-featured coding agent | **Indusagi** |
| **Developer Experience** | Steep learning curve | Easy to learn | Indusagi |
| **Production Readiness** | Excellent | Basic | **Mastra** |
| **Extensibility** | Good (via plugins) | Excellent (simple architecture) | Indusagi |
| **Event System** | Basic (observability events) | Rich event bus | Indusagi |
| **Type Safety** | Excellent (Zod + TypeScript) | Good (TypeBox + TypeScript) | Mastra |

### 4.2 Strengths & Weaknesses

#### Mastra

**Strengths:**
1. ✅ **Model Routing**: Best-in-class provider abstraction with 40+ providers and automatic fallbacks
2. ✅ **Workflows**: Powerful graph-based orchestration for complex multi-step processes
3. ✅ **Observability**: Built-in OpenTelemetry for production monitoring
4. ✅ **Storage**: Comprehensive persistence with multiple backend options
5. ✅ **Memory/RAG**: Full-featured with vector stores and semantic search
6. ✅ **MCP Support**: First-class Model Context Protocol integration
7. ✅ **Evaluation**: Built-in framework for testing and validation
8. ✅ **Production Ready**: Designed for enterprise deployment
9. ✅ **Server Adapters**: Hono, Express, Next.js integrations
10. ✅ **Multi-Agent Networks**: Support for agent collaboration

**Weaknesses:**
1. ❌ **High Complexity**: Steep learning curve, over-engineered for simple use cases
2. ❌ **Code Size**: 276K+ lines, difficult to navigate
3. ❌ **No TUI**: No terminal UI for interactive sessions
4. ❌ **Limited CLI**: Basic create CLI, not a full coding agent
5. ✅ **Overkill**: Many features unnecessary for simple agents
6. ✅ **Tight Coupling**: Components tightly coupled to storage layer

#### Indusagi

**Strengths:**
1. ✅ **Simplicity**: Clean, elegant architecture, easy to understand
2. ✅ **Event-Driven**: Rich event bus for extensibility and real-time updates
3. ✅ **TUI**: Excellent terminal UI with beautiful interface
4. ✅ **CLI Tooling**: Full-featured coding agent with multiple modes
5. ✅ **Steering/Follow-Up**: Unique and intuitive message queuing
6. ✅ **Extensibility**: Easy to extend due to simple architecture
7. ✅ **Fast Development**: Quick to build and iterate
8. ✅ **Good Tooling**: Simple but functional tool system
9. ✅ **Session Management**: Good for iterative development
10. ✅ **Local Model Support**: Ollama, LM Studio integration

**Weaknesses:**
1. ❌ **No Persistence**: No database-backed state storage
2. ❌ **Limited Observability**: Minimal telemetry and monitoring
3. ❌ **No Workflows**: Loop-only execution, no graph orchestration
4. ❌ **Basic Memory**: No vector stores or semantic search
5. ❌ **No Model Routing**: Manual provider selection
6. ❌ **No Evaluation**: No built-in testing framework
7. ❌ **No MCP Support**: Model Context Protocol not implemented
8. ❌ **Limited Documentation**: Not comprehensive enough for production use

### 4.3 Best Practices Identified

#### From Mastra:

1. **Model Router Architecture**: Unified interface for 40+ providers with intelligent routing
2. **Workflow Engine**: Graph-based orchestration for complex multi-step processes
3. **OpenTelemetry Integration**: Production-grade observability
4. **Storage Abstraction**: Pluggable backends for state persistence
5. **Memory/RAG System**: Vector-based semantic search with context window management
6. **Human-in-the-Loop**: Suspend/resume with state persistence
7. **Evaluation Framework**: Automated testing and validation
8. **Type Safety with Zod**: Comprehensive schema validation
9. **Processor Pipeline**: Pre/post-processing for inputs and outputs
10. **Server Adapters**: Easy integration with existing web frameworks

#### From Indusagi:

1. **Event Bus Architecture**: Simple, type-safe event system for extensibility
2. **Steering/Follow-Up Queues**: Intuitive message queuing for agent control
3. **Clean Agent Loop**: Elegant, understandable loop implementation
4. **Functional Tool System**: Simple tool definitions without builder pattern
5. **TUI Excellence**: Beautiful, responsive terminal UI
6. **Transform Pipeline**: Flexible context manipulation before LLM calls
7. **Session Management**: Good support for iterative development
8. **CLI Modes**: Multiple modes for different use cases (interactive, print, JSON, RPC)
9. **Hooks System**: Extensible without modifying core code
10. **Simplicity First**: Focused on core functionality, minimal complexity

---

## 5. Recommended Architecture for New Framework

### 5.1 Design Principles

1. **Simplicity First**: Start with Indusagi's clean architecture, add Mastra's features incrementally
2. **Modular Design**: Features as opt-in plugins, not monolithic components
3. **Progressive Enhancement**: Core framework works without storage, storage is optional
4. **Developer Experience**: Easy to learn, powerful when needed
5. **Production Ready**: But not over-engineered for simple use cases

### 5.2 Proposed Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NEW AGENT FRAMEWORK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   CORE LAYER                             │  │
│  │  - Agent Loop (Indusagi-style, simplified)             │  │
│  │  - Event Bus (Indusagi)                                │  │
│  │  - State Manager (Indusagi)                             │  │
│  │  - Tool System (Simplified Mastra builder + Indusagi)   │  │
│  │  - Model Abstraction (Mastra model router)              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                    │
│  ┌─────────────────────────┼───────────────────────────────┐  │
│  │                         │                               │  │
│  ▼                         ▼                               │  │
│ ┌─────────┐          ┌─────────────┐                      │  │
│ │  TUI    │          │  Workflows  │                      │  │
│ │(Indusagi)│         │  (Mastra)   │                      │  │
│ └─────────┘          └─────────────┘                      │  │
│                           │                                 │  │
│                           ▼                                 │  │
│                    ┌─────────────┐                          │  │
│                    │   Storage   │                          │  │
│                    │  (Mastra)   │                          │  │
│                    └─────────────┘                          │  │
│                           │                                 │  │
│                           ▼                                 │  │
│                    ┌─────────────┐                          │  │
│                    │  Observability│                         │  │
│                    │  (Mastra)   │                          │  │
│                    └─────────────┘                          │  │
│                           │                                 │  │
│                           ▼                                 │  │
│                    ┌─────────────┐                          │  │
│                    │   Memory    │                          │  │
│                    │  (Mastra)   │                          │  │
│                    └─────────────┘                          │  │
│                           │                                 │  │
│                           ▼                                 │  │
│                    ┌─────────────┐                          │  │
│                    │     MCP     │                          │  │
│                    │  (Mastra)   │                          │  │
│                    └─────────────┘                          │  │
│                           │                                 │  │
│                           ▼                                 │  │
│                    ┌─────────────┐                          │  │
│                    │ Evaluation  │                          │  │
│                    │  (Mastra)   │                          │  │
│                    └─────────────┘                          │  │
│                           │                                 │  │
│                           ▼                                 │  │
│                    ┌─────────────┐                          │  │
│                    │    CLI      │                          │  │
│                    │(Indusagi-CA)│                         │  │
│                    └─────────────┘                          │  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 What to Take from Mastra (Priority: HIGH)

#### 5.3.1 Model Router ⭐⭐⭐⭐⭐

**Why:** Best-in-class provider abstraction with 40+ providers, automatic fallbacks, and intelligent routing.

**Implementation:**
```typescript
// Simplified model router
class ModelRouter {
  constructor(
    private providers: Map<string, ProviderAdapter>,
    private routingStrategy: RoutingStrategy
  ) {}

  async route(requirements: ModelRequirements): Model {
    return this.routingStrategy.select(this.providers, requirements);
  }

  async generate(model, context, options) {
    // Try primary model, fallback to alternatives
    return withFallback(async () => {
      return await model.generate(context, options);
    });
  }
}

// Usage
const model = await modelRouter.route({
  capabilities: ['vision', 'streaming'],
  maxCost: 0.01
});
```

**Benefits:**
- Single API for all providers
- Automatic fallback on failure
- Cost optimization
- Feature-aware routing

#### 5.3.2 Storage Abstraction ⭐⭐⭐⭐⭐

**Why:** Production-ready state persistence with pluggable backends.

**Implementation:**
```typescript
// Optional storage (works without it)
interface Storage {
  saveState(agentId: string, state: AgentState): Promise<void>;
  loadState(agentId: string): Promise<AgentState | null>;
  // ... other storage operations
}

// In-memory storage (default)
class InMemoryStorage implements Storage {
  private store = new Map<string, AgentState>();
  // ... implementation
}

// PostgreSQL storage (opt-in)
class PostgresStorage implements Storage {
  private pool: Pool;
  // ... implementation
}

// Agent works with or without storage
class Agent {
  constructor(
    private storage?: Storage  // Optional!
  ) {}

  async save() {
    if (this.storage) {
      await this.storage.saveState(this.id, this.state);
    }
  }
}
```

**Benefits:**
- Works without storage (in-memory default)
- Easy to add persistence when needed
- Multiple backend options
- No database required for development

#### 5.3.3 Observability (OpenTelemetry) ⭐⭐⭐⭐

**Why:** Production-grade monitoring and debugging.

**Implementation:**
```typescript
// Opt-in observability
interface ObservabilityConfig {
  enabled?: boolean;
  otel?: {
    endpoint: string;
    serviceName: string;
  };
}

class Agent {
  private tracer: Tracer | null;

  constructor(
    private observability?: ObservabilityConfig
  ) {
    this.tracer = observability?.enabled
      ? trace.getTracer(observability.otel?.serviceName || 'agent')
      : null;
  }

  async prompt(message: AgentMessage) {
    return this.tracer
      ? this.tracer.startActiveSpan('agent.prompt', async (span) => {
          const result = await this._runLoop([message]);
          span.end();
          return result;
        })
      : this._runLoop([message]);
  }
}
```

**Benefits:**
- Opt-in, not required
- Open standards
- Deep visibility when needed
- Integration with APM tools

#### 5.3.4 Memory/RAG ⭐⭐⭐⭐

**Why:** Context management and semantic search for better agent performance.

**Implementation:**
```typescript
// Optional memory system
interface MemorySystem {
  workingMemory: WorkingMemory;
  semanticMemory?: SemanticMemory;  // Vector-based
}

class Agent {
  private memory?: MemorySystem;

  transformContext: async (messages) => {
    // Prune if too long
    if (estimateTokens(messages) > MAX_TOKENS) {
      messages = await this.memory?.workingMemory.prune(messages) || prune(messages);
    }

    // Add relevant semantic context if available
    if (this.memory?.semanticMemory) {
      const context = await this.memory.semanticMemory.retrieve(messages);
      messages.push(...context);
    }

    return messages;
  }
}
```

**Benefits:**
- Better context management
- Semantic search for relevant information
- Context window optimization
- Opt-in complexity

#### 5.3.5 MCP Support ⭐⭐⭐⭐

**Why:** Open protocol for tool sharing and ecosystem integration.

**Implementation:**
```typescript
// MCP server support (opt-in)
class MCPServer {
  constructor(private agent: Agent) {}

  async expose() {
    return {
      tools: this.agent.tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        // ... MCP tool schema
      }))
    };
  }

  async handleCall(toolName: string, args: any) {
    return await this.agent.executeTool(toolName, args);
  }
}
```

**Benefits:**
- Open standard
- Tool sharing across agents
- Ecosystem integration
- Future-proof

#### 5.3.6 Workflows ⭐⭐⭐

**Why:** Complex multi-step process orchestration.

**Implementation:**
```typescript
// Simplified workflow DSL
const workflow = createWorkflow({
  id: 'my-workflow',
  steps: [
    step('analyze', async (context) => {
      // Step 1
    }),
    step('process', async (context) => {
      // Step 2
    })
  ]
})
  .then('analyze', 'process')
  .branch(condition, 'process', 'alternative')
  .parallel(['step3', 'step4']);

// Execute
await workflow.run({ /* initial context */ });
```

**Benefits:**
- Visual workflow builder
- Complex orchestration
- Suspend/resume for human input
- Good for production workflows

**Note:** Keep workflows optional, not required for simple agents.

#### 5.3.7 Evaluation Framework ⭐⭐⭐

**Why:** Automated testing and validation for production.

**Implementation:**
```typescript
// Simple evaluation API
const evaluation = await agent.evaluate({
  dataset: [
    { input: '2+2', expected: '4' },
    { input: '3+3', expected: '6' }
  ],
  evaluators: [
    evaluator('accuracy', ({ output, expected }) => {
      return output === expected ? 1 : 0;
    })
  ]
});

console.log(evaluation.scores);
```

**Benefits:**
- Automated testing
- Dataset support
- CI/CD integration
- Quality assurance

### 5.4 What to Take from Indusagi (Priority: HIGH)

#### 5.4.1 Event Bus Architecture ⭐⭐⭐⭐⭐

**Why:** Simple, type-safe, perfect for extensibility and real-time updates.

**Implementation:**
```typescript
class AgentEventBus {
  private listeners = new Map<EventType, Set<Listener>>();

  subscribe<T extends AgentEvent>(
    eventType: EventType,
    listener: (event: T) => void
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);

    // Return unsubscribe function
    return () => this.listeners.get(eventType)!.delete(listener);
  }

  emit(event: AgentEvent) {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }
}
```

**Benefits:**
- Simple API
- Type-safe events
- Perfect for TUI updates
- Easy extensibility

#### 5.4.2 Steering/Follow-Up Queues ⭐⭐⭐⭐⭐

**Why:** Intuitive message queuing for agent control, no workflow DSL needed.

**Implementation:**
```typescript
class Agent {
  private steeringQueue: AgentMessage[] = [];
  private followUpQueue: AgentMessage[] = [];

  // Interrupt agent mid-execution
  steer(message: AgentMessage) {
    this.steeringQueue.push(message);
  }

  // Queue message after agent finishes
  followUp(message: AgentMessage) {
    this.followUpQueue.push(message);
  }

  private async _runLoop() {
    while (true) {
      // Process steering messages first
      if (this.steeringQueue.length > 0) {
        const message = this.steeringQueue.shift()!;
        this.state.messages.push(message);
      }

      // ... process tool calls

      // Check for follow-up messages
      if (!hasMoreToolCalls && this.followUpQueue.length > 0) {
        const message = this.followUpQueue.shift()!;
        this.state.messages.push(message);
        continue; // Another turn
      }

      // No more messages, exit
      break;
    }
  }
}
```

**Benefits:**
- Intuitive API
- No complex workflow DSL
- Perfect for interactive sessions
- Flexible queue modes

#### 5.4.3 Clean Agent Loop ⭐⭐⭐⭐⭐

**Why:** Elegant, understandable loop implementation, easy to debug.

**Implementation:**
```typescript
async function agentLoop(
  prompts: AgentMessage[],
  context: AgentContext,
  config: AgentLoopConfig,
  signal?: AbortSignal
): EventStream<AgentEvent, AgentMessage[]> {
  const stream = new EventStream<AgentEvent, AgentMessage[]>();

  (async () => {
    let currentContext = { ...context, messages: [...context.messages, ...prompts] };

    stream.push({ type: 'agent_start' });

    while (true) {
      stream.push({ type: 'turn_start' });

      // Stream assistant response
      const message = await streamAssistantResponse(currentContext, config, signal, stream);
      currentContext.messages.push(message);

      // Execute tool calls if any
      const toolCalls = message.content.filter(c => c.type === 'toolCall');
      if (toolCalls.length > 0) {
        const results = await executeToolCalls(toolCalls, currentContext.tools, signal, stream);
        currentContext.messages.push(...results);
        stream.push({ type: 'turn_end', message, toolResults: results });
        continue; // Another turn for tool results
      }

      // No more tool calls, check for steering/follow-up
      const pending = await getPendingMessages(config);
      if (pending.length > 0) {
        currentContext.messages.push(...pending);
        stream.push({ type: 'turn_end', message, toolResults: [] });
        continue; // Another turn
      }

      // Done
      stream.push({ type: 'turn_end', message, toolResults: [] });
      stream.push({ type: 'agent_end', messages: currentContext.messages });
      stream.end(currentContext.messages);
      return;
    }
  })();

  return stream;
}
```

**Benefits:**
- Simple and predictable
- Easy to debug
- Good separation of concerns
- Event-driven for real-time updates

#### 5.4.4 TUI Excellence ⭐⭐⭐⭐⭐

**Why:** Beautiful, responsive terminal UI, excellent for interactive development.

**Implementation:**
```typescript
class TUI {
  constructor(private agent: Agent) {
    // Subscribe to agent events
    this.agent.subscribe(this.handleEvent.bind(this));
  }

  private handleEvent(event: AgentEvent) {
    switch (event.type) {
      case 'message_start':
        this.renderMessageStart(event.message);
        break;
      case 'message_update':
        this.renderMessageUpdate(event.message);
        break;
      case 'tool_execution_start':
        this.renderToolStart(event.toolCallId);
        break;
      case 'tool_execution_end':
        this.renderToolEnd(event.toolCallId, event.result);
        break;
    }
  }

  // Beautiful rendering with syntax highlighting, markdown, etc.
}
```

**Benefits:**
- Beautiful and responsive
- Rich feature set
- Customizable themes
- Excellent interactive experience

#### 5.4.5 Transform Pipeline ⭐⭐⭐⭐

**Why:** Flexible context manipulation before LLM calls.

**Implementation:**
```typescript
class Agent {
  constructor(
    private transformContext?: (messages: AgentMessage[], signal?: AbortSignal) => Promise<AgentMessage[]>
  ) {}

  private async _runLoop() {
    while (true) {
      // Transform context before each LLM call
      let messages = this.state.messages;
      if (this.transformContext) {
        messages = await this.transformContext(messages, this.abortController?.signal);
      }

      // Convert to LLM-compatible messages
      const llmMessages = await this.convertToLlm(messages);

      // Call LLM
      const response = await this.model.generate(llmMessages);

      // ...
    }
  }
}
```

**Benefits:**
- Flexible context manipulation
- Separation of concerns
- User control over context window
- External context injection

#### 5.4.6 Simple Tool System ⭐⭐⭐⭐

**Why:** Functional tool definitions without builder pattern.

**Implementation:**
```typescript
// Simple tool definition
const readFile: AgentTool<{ path: string }> = {
  name: 'read_file',
  description: 'Read a file from the filesystem',
  parameters: Type.Object({
    path: Type.String()
  }),
  handler: async ({ path }, context) => {
    return await fs.readFile(path, 'utf-8');
  }
};

// Add to agent
agent.setTools([readFile]);
```

**Benefits:**
- Simple tool definition
- Type-safe with TypeBox
- Easy to understand
- No builder pattern overhead

**Enhancement:** Combine with Mastra's tool validation and approval workflow.

#### 5.4.7 CLI Modes ⭐⭐⭐⭐

**Why:** Multiple modes for different use cases (interactive, print, JSON, RPC).

**Implementation:**
```bash
# Interactive mode (default)
agent-cli

# Print mode for scripting
agent-cli --print "Generate code"

# JSON mode for automation
agent-cli --json "Generate JSON"

# RPC mode for process integration
agent-cli --rpc

# File-aware prompts
agent-cli @src/index.ts "Summarize this file"
```

**Benefits:**
- Multiple modes for different use cases
- Scriptable via JSON output
- RPC for process integration
- File-aware operations

### 5.5 New Innovations

#### 5.5.1 Plugin System

**Why:** Make advanced features opt-in plugins, not core dependencies.

**Implementation:**
```typescript
interface Plugin {
  name: string;
  version: string;
  install?(agent: Agent): void;
  uninstall?(agent: Agent): void;
}

// Storage plugin (opt-in)
const storagePlugin: Plugin = {
  name: 'storage',
  version: '1.0.0',
  install: (agent) => {
    agent.storage = new PostgresStorage();
  }
};

// Observability plugin (opt-in)
const observabilityPlugin: Plugin = {
  name: 'observability',
  version: '1.0.0',
  install: (agent) => {
    agent.observability = new OpenTelemetryObservability();
  }
};

// Usage
const agent = new Agent({
  plugins: [storagePlugin, observabilityPlugin]  // Optional!
});
```

#### 5.5.2 Progressive Enhancement

**Why:** Core framework works without advanced features, add them as needed.

**Implementation:**
```typescript
// Level 1: Core (works without any plugins)
const agent = new Agent();  // In-memory, no observability

// Level 2: Add storage
const agent = new Agent({
  storage: new PostgresStorage()
});

// Level 3: Add observability
const agent = new Agent({
  storage: new PostgresStorage(),
  observability: new OpenTelemetryObservability()
});

// Level 4: Full production setup
const agent = new Agent({
  storage: new PostgresStorage(),
  observability: new OpenTelemetryObservability(),
  memory: new MemorySystem(),
  mcp: new MCPSupport()
});
```

#### 5.5.3 Configuration Hot-Reloading

**Why:** Update agent configuration without restarting.

**Implementation:**
```typescript
class Agent {
  private config: AgentConfig;

  updateConfig(partialConfig: Partial<AgentConfig>) {
    this.config = { ...this.config, ...partialConfig };
    this.emit({ type: 'config_updated', config: this.config });
  }

  // Hot-reload model, tools, system prompt, etc.
  setModel(model: Model) {
    this.config.model = model;
  }

  setSystemPrompt(prompt: string) {
    this.config.systemPrompt = prompt;
  }
}
```

#### 5.5.4 Multi-Session Support

**Why:** Manage multiple agent sessions with shared context.

**Implementation:**
```typescript
class SessionManager {
  private sessions = new Map<string, Agent>();

  createSession(id: string, config: AgentConfig): Agent {
    const agent = new Agent(config);
    this.sessions.set(id, agent);
    return agent;
  }

  getSession(id: string): Agent | undefined {
    return this.sessions.get(id);
  }

  shareContext(fromId: string, toId: string) {
    const from = this.sessions.get(fromId);
    const to = this.sessions.get(toId);
    if (from && to) {
      to.state.messages = [...from.state.messages];
    }
  }
}
```

---

## 6. Implementation Roadmap

### Phase 1: Core Foundation (Weeks 1-4)

**Goal:** Build minimal, functional agent framework

**Tasks:**

1. **Week 1: Core Agent**
   - [ ] Implement Agent class with event bus
   - [ ] Implement simple agent loop
   - [ ] Implement state manager
   - [ ] Basic tool system
   - [ ] Model abstraction layer (no routing yet)

2. **Week 2: Tool System**
   - [ ] Complete tool implementation
   - [ ] Built-in tools (read, write, bash, websearch)
   - [ ] Tool execution with error handling
   - [ ] Tool result streaming

3. **Week 3: Event System**
   - [ ] Event bus implementation
   - [ ] Event types and interfaces
   - [ ] Subscription management
   - [ ] Event filtering (optional)

4. **Week 4: CLI Foundation**
   - [ ] Basic CLI with interactive mode
   - [ ] Command parsing
   - [ ] Configuration management
   - [ ] Session persistence (file-based)

**Deliverables:**
- Working agent with tools
- Basic CLI
- File-based sessions
- ~10K lines of code

### Phase 2: Enhanced Features (Weeks 5-8)

**Goal:** Add Mastra's best features while keeping simplicity

**Tasks:**

1. **Week 5: Model Routing**
   - [ ] Model router implementation
   - [ ] Provider adapters (OpenAI, Anthropic, Google)
   - [ ] Automatic fallbacks
   - [ ] Cost-based routing

2. **Week 6: Storage & Persistence**
   - [ ] Storage abstraction layer
   - [ ] In-memory storage (default)
   - [ ] PostgreSQL storage (opt-in)
   - [ ] State serialization

3. **Week 7: Memory System**
   - [ ] Working memory implementation
   - [ ] Context pruning
   - [ ] Semantic memory (opt-in, vector stores)
   - [ ] Context retrieval

4. **Week 8: TUI Enhancement**
   - [ ] Beautiful terminal UI (Indusagi-style)
   - [ ] Markdown rendering
   - [ ] Syntax highlighting
   - [ ] Multi-panel layout
   - [ ] Customizable themes

**Deliverables:**
- Model routing with fallbacks
- Optional storage backends
- Memory system with semantic search
- Beautiful TUI
- ~25K lines of code

### Phase 3: Production Features (Weeks 9-12)

**Goal:** Add production-grade features

**Tasks:**

1. **Week 9: Observability**
   - [ ] OpenTelemetry integration
   - [ ] Span generation for all operations
   - [ ] Performance metrics
   - [ ] Error tracking

2. **Week 10: Workflows**
   - [ ] Simplified workflow DSL
   - [ ] Graph orchestration
   - [ ] Suspend/resume for human input
   - [ ] Visual workflow builder (optional)

3. **Week 11: MCP Support**
   - [ ] MCP server implementation
   - [ ] Expose tools via MCP
   - [ ] Consume external MCP servers
   - [ ] MCP registry

4. **Week 12: Evaluation Framework**
   - [ ] Simple evaluation API
   - [ ] Built-in evaluators
   - [ ] Dataset support
   - [ ] CI/CD integration

**Deliverables:**
- Full observability
- Workflow orchestration
- MCP support
- Evaluation framework
- ~40K lines of code

### Phase 4: Polish & Documentation (Weeks 13-16)

**Goal:** Production-ready framework

**Tasks:**

1. **Week 13: Testing**
   - [ ] Unit tests (80%+ coverage)
   - [ ] Integration tests
   - [ ] E2E tests
   - [ ] Performance benchmarks

2. **Week 14: Documentation**
   - [ ] Getting started guide
   - [ ] API documentation
   - [ ] Examples and tutorials
   - [ ] Migration guides

3. **Week 15: CLI Polish**
   - [ ] Multiple CLI modes (print, JSON, RPC)
   - [ ] File-aware prompts
   - [ ] Session tree navigation
   - [ ] Extension system

4. **Week 16: Release Preparation**
   - [ ] Package structure
   - [ ] NPM publishing
   - [ ] CI/CD setup
   - [ ] Release notes

**Deliverables:**
- Production-ready framework
- Comprehensive documentation
- Full-featured CLI
- NPM package
- ~50K lines of code (vs 276K for Mastra!)

---

## 7. Conclusion

### 7.1 Summary

**Mastra** is a production-ready, feature-rich framework with excellent model routing, workflows, observability, storage, and memory/RAG. However, it's complex (276K lines), over-engineered for simple use cases, and lacks good TUI and CLI tooling.

**Indusagi** is a simple, elegant framework (38K lines) with a clean agent loop, excellent event system, beautiful TUI, and full-featured CLI. However, it lacks persistence, observability, workflows, memory/RAG, and model routing.

### 7.2 Recommendation

Build a **new framework** that combines the best of both:

- **Start with Indusagi's architecture**: Clean, simple, event-driven
- **Add Mastra's key features**: Model routing, storage, observability, memory/RAG, MCP, workflows
- **Keep it modular**: Features as opt-in plugins, not monolithic components
- **Progressive enhancement**: Works without advanced features, add them as needed
- **Target ~50K lines**: 25% of Mastra's size with 80% of its functionality

### 7.3 Key Differentiators

1. **Simplicity First**: Easy to learn and use, powerful when needed
2. **Modular Design**: Features as opt-in plugins
3. **Best of Both Worlds**: Indusagi's elegance + Mastra's production features
4. **Developer Experience**: Excellent TUI + CLI + API
5. **Production Ready**: But not over-engineered

### 7.4 Success Metrics

- **Code Size**: <50K lines (vs 276K for Mastra)
- **Time to Hello World**: <5 minutes
- **Learning Curve**: Basic usage in 1 hour, advanced features in 1 day
- **Performance**: Equal or better than Mastra/Indusagi
- **Developer Satisfaction**: High (simple API, good documentation, great CLI/TUI)
- **Production Adoption**: Used in production by multiple teams

---

## Appendix: Code Examples

### A.1 Simple Agent (Level 1)

```typescript
import { Agent } from '@new-framework/core';

const agent = new Agent({
  id: 'my-agent',
  systemPrompt: 'You are a helpful assistant',
  model: 'openai/gpt-4'
});

await agent.prompt('Hello!');
```

### A.2 Agent with Storage (Level 2)

```typescript
import { Agent } from '@new-framework/core';
import { PostgresStorage } from '@new-framework/storage';

const agent = new Agent({
  id: 'my-agent',
  systemPrompt: 'You are a helpful assistant',
  model: 'openai/gpt-4',
  storage: new PostgresStorage({
    connectionString: 'postgresql://...'
  })
});

await agent.prompt('Hello!');  // Automatically persisted
```

### A.3 Agent with All Features (Level 3)

```typescript
import { Agent } from '@new-framework/core';
import { PostgresStorage } from '@new-framework/storage';
import { OpenTelemetryObservability } from '@new-framework/observability';
import { MemorySystem } from '@new-framework/memory';
import { MCPSupport } from '@new-framework/mcp';

const agent = new Agent({
  id: 'my-agent',
  systemPrompt: 'You are a helpful assistant',
  model: 'openai/gpt-4',
  storage: new PostgresStorage(),
  observability: new OpenTelemetryObservability({
    endpoint: 'http://otel-collector:4317',
    serviceName: 'my-agent'
  }),
  memory: new MemorySystem({
    vectorStore: new PgVectorStore(),
    embeddingModel: 'openai/text-embedding-3-small'
  }),
  mcp: new MCPSupport(),
  tools: [myCustomTool]
});

await agent.prompt('Hello!');  // Full observability, memory, MCP
```

### A.4 CLI Usage

```bash
# Interactive mode
agent-cli

# Print mode
agent-cli --print "Generate code"

# JSON mode
agent-cli --json "Generate JSON"

# RPC mode
agent-cli --rpc

# File-aware prompt
agent-cli @src/index.ts "Summarize this file"

# With configuration
agent-cli --config .agentrc "Hello!"
```

---

**End of Analysis**

*This analysis provides a comprehensive guide for building a next-generation agent framework that combines the best of Mastra and Indusagi while keeping simplicity and developer experience as top priorities.*
