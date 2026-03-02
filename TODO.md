# Astra Framework - Implementation Roadmap

## 📊 Current Status

### Phase 1: Core Foundation ✅ COMPLETE
- [x] Agent class with event bus
- [x] Agent loop with steering/follow-up
- [x] Simple tool system
- [x] Model router with fallbacks
- [x] Built-in tools
- [x] Complete type system
- [x] State manager
- [x] Basic documentation

**Status:** 16 files, ~5,100 lines ✅

---

## 🚧 Phase 2: Enhanced Features (TO DO)

### 2.1 Storage Abstraction ⏳

**Files to create:**
```
src/storage/
├── index.ts              # Storage exports
├── base.ts               # Storage backend interface
├── in-memory.ts          # In-memory storage (default)
├── file-storage.ts       # File-based storage
└── postgres.ts           # PostgreSQL storage
```

**Features:**
- [ ] Storage backend interface
- [ ] In-memory storage implementation
- [ ] File-based storage with JSON persistence
- [ ] PostgreSQL storage with connection pooling
- [ ] State serialization/deserialization
- [ ] Migration support
- [ ] Unit tests

**Estimated lines:** ~1,500 lines

**Priority:** HIGH (needed for persistence)

---

### 2.2 Observability (OpenTelemetry) ⏳

**Files to create:**
```
src/observability/
├── index.ts              # Observability exports
├── tracer.ts             # OpenTelemetry tracer
├── span.ts               # Span management
├── metrics.ts            # Metrics collection
└── logger.ts             # Structured logging
```

**Features:**
- [ ] OpenTelemetry tracer integration
- [ ] Span management for all operations
- [ ] Metrics collection (duration, token usage, cost)
- [ ] Structured logging (debug, info, warn, error)
- [ ] Console logger
- [ ] File logger
- [ ] OTLP exporter (Jaeger, Datadog, etc.)
- [ ] Configurable log levels
- [ ] Unit tests

**Estimated lines:** ~1,200 lines

**Priority:** HIGH (needed for production monitoring)

---

### 2.3 Memory System ⏳

**Files to create:**
```
src/memory/
├── index.ts              # Memory exports
├── working.ts            # Working memory (pruning, prioritization)
├── semantic.ts           # Semantic memory (vector-based)
├── vector-stores/
│   ├── base.ts           # Vector store interface
│   ├── pgvector.ts      # PostgreSQL pgvector
│   └── memory.ts        # In-memory vectors
└── embeddings/
    ├── base.ts           # Embedding interface
    ├── openai.ts        # OpenAI embeddings
    └── local.ts         # Local embeddings
```

**Features:**
- [ ] Working memory with context pruning
- [ ] Context window management
- [ ] Message prioritization
- [ ] Semantic memory with vector search
- [ ] Embedding providers (OpenAI, local)
- [ ] Vector store backends (pgvector, memory)
- [ ] Top-K retrieval
- [ ] Hybrid search (semantic + keyword)
- [ ] Unit tests

**Estimated lines:** ~2,000 lines

**Priority:** MEDIUM (nice to have, improves context quality)

---

### 2.4 TUI (Terminal UI) ⏳

**Files to create:**
```
src/tui/
├── index.ts              # TUI exports
├── renderer.ts           # Rendering engine
├── panels/
│   ├── chat.ts          # Chat panel
│   ├── tools.ts         # Tools panel
│   └── status.ts        # Status panel
├── components/
│   ├── message.ts       # Message component
│   ├── code.ts          # Code block component
│   └── thinking.ts      # Thinking block component
└── themes/
    ├── default.ts        # Default theme
    └── dracula.ts       # Dracula theme
```

**Features:**
- [ ] TUI renderer with Blessed/blessed-contrib
- [ ] Chat panel with message history
- [ ] Real-time message streaming
- [ ] Markdown rendering with syntax highlighting
- [ ] Code blocks with language detection
- [ ] Thinking/reasoning blocks
- [ ] Tool execution panel
- [ ] Status indicators (streaming, error, etc.)
- [ ] Command palette (Ctrl+P)
- [ ] Keyboard shortcuts
- [ ] Scrollable panels
- [ ] Theme support (default, dracula, etc.)
- [ ] Resize handling
- [ ] Mouse support
- [ ] Integration with agent events

**Estimated lines:** ~2,500 lines

**Priority:** MEDIUM (great UX, but not essential for core)

---

### 2.5 CLI with Multiple Modes ⏳

**Files to create:**
```
src/cli/
├── index.ts              # CLI exports
├── cli.ts                # Main CLI entry
├── modes/
│   ├── interactive.ts    # Interactive mode
│   ├── print.ts         # Print mode
│   ├── json.ts          # JSON mode
│   └── rpc.ts           # RPC mode
├── commands/
│   ├── login.ts         # Login command
│   ├── config.ts        # Config command
│   └── session.ts       # Session management
└── utils/
    ├── prompt.ts        # Interactive prompts
    └── output.ts       # Output formatting
```

**Features:**
- [ ] Interactive mode (with TUI)
- [ ] Print mode (stdout output)
- [ ] JSON mode (machine-readable output)
- [ ] RPC mode (for process integration)
- [ ] File-aware prompts (@file syntax)
- [ ] Session management (list, load, delete)
- [ ] Config management (get, set, list)
- [ ] Login command (set API keys)
- [ ] Multi-line input support
- [ ] Command history
- [ ] Auto-completion
- [ ] Help system
- [ ] Version flag
- [ ] Verbosity levels
- [ ] Error handling with nice messages

**Estimated lines:** ~2,000 lines

**Priority:** HIGH (needed for usability)

---

## ⏳ Phase 3: Production Features (TODO)

### 3.1 Workflow Engine ⏳

**Files to create:**
```
src/workflows/
├── index.ts              # Workflow exports
├── workflow.ts           # Workflow class
├── step.ts               # Step class
├── graph.ts              # Graph orchestration
├── transitions.ts        # Transition management
└── suspend/
    ├── manager.ts        # Suspend/resume manager
    └── storage.ts       # Suspend state storage
```

**Features:**
- [ ] Workflow class with steps
- [ ] Step class with timeout, retries
- [ ] Graph-based orchestration
- [ ] Sequential execution (.then())
- [ ] Parallel execution (.parallel())
- [ ] Branching (.branch())
- [ ] Loops (.loop())
- [ ] Condition evaluation
- [ ] Human-in-the-loop (suspend/resume)
- [ ] State persistence
- [ ] Visual workflow builder (CLI)
- [ ] Workflow export/import
- [ ] Error handling and retry logic
- [ ] Unit tests

**Estimated lines:** ~2,500 lines

**Priority:** MEDIUM (complex use cases)

---

### 3.2 MCP Support ⏳

**Files to create:**
```
src/mcp/
├── index.ts              # MCP exports
├── server.ts             # MCP server
├── client.ts             # MCP client
├── tools.ts              # Tool exposure
├── resources.ts          # Resource exposure
└── registry.ts           # MCP registry
```

**Features:**
- [ ] MCP server implementation
- [ ] MCP client implementation
- [ ] Expose agent tools as MCP tools
- [ ] Consume external MCP tools
- [ ] Resource management
- [ ] Prompt templates
- [ ] MCP registry and discovery
- [ ] Transport layer (stdio, SSE)
- [ ] JSON-RPC 2.0
- [ ] Integration with agent tools
- [ ] Unit tests

**Estimated lines:** ~1,800 lines

**Priority:** LOW (nice for ecosystem, but not essential)

---

### 3.3 Evaluation Framework ⏳

**Files to create:**
```
src/evals/
├── index.ts              # Evaluation exports
├── evaluator.ts          # Evaluator base class
├── scorers/
│   ├── accuracy.ts      # Accuracy scorer
│   ├── relevance.ts     # Relevance scorer
│   └── custom.ts        # Custom scorer
├── dataset.ts            # Dataset management
├── runner.ts             # Evaluation runner
└── report.ts             # Report generation
```

**Features:**
- [ ] Evaluator base class
- [ ] Built-in scorers (accuracy, relevance, etc.)
- [ ] Custom scorer support
- [ ] Dataset management (load, save, filter)
- [ ] Evaluation runner (parallel/sequential)
- [ ] Report generation (JSON, HTML, console)
- [ ] Metrics (precision, recall, F1, etc.)
- [ ] CI/CD integration
- [ ] Progress tracking
- [ ] Result comparison
- [ ] Unit tests

**Estimated lines:** ~1,500 lines

**Priority:** LOW (nice for testing, but not essential)

---

### 3.4 Testing Infrastructure ⏳

**Files to create:**
```
tests/
├── unit/
│   ├── agent.test.ts
│   ├── events.test.ts
│   ├── loop.test.ts
│   ├── tools.test.ts
│   └── models.test.ts
├── integration/
│   ├── storage.test.ts
│   ├── observability.test.ts
│   └── memory.test.ts
├── e2e/
│   ├── full-agent.test.ts
│   └── workflows.test.ts
└── fixtures/
    ├── mock-data.ts
    └── test-tools.ts
```

**Features:**
- [ ] Unit tests for all modules (80%+ coverage)
- [ ] Integration tests for storage, observability, memory
- [ ] E2E tests for full agent workflows
- [ ] Mock LLM providers for testing
- [ ] Test fixtures and utilities
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Coverage reporting (vitest + c8)
- [ ] Performance benchmarks
- [ ] Snapshot testing

**Estimated lines:** ~3,000 lines

**Priority:** MEDIUM (needed for production quality)

---

### 3.5 Full Documentation ⏳

**Files to create:**
```
docs/
├── api/
│   ├── agent.md        # Agent API docs
│   ├── events.md       # Events API docs
│   ├── tools.md        # Tools API docs
│   └── models.md       # Models API docs
├── guides/
│   ├── getting-started.md
│   ├── tools.md        # Custom tools guide
│   ├── storage.md      # Storage guide
│   ├── observability.md # Observability guide
│   └── deployment.md   # Deployment guide
├── examples/
│   ├── basic-agent.md
│   ├── custom-tools.md
│   ├── with-storage.md
│   └── workflows.md
└── architecture/
    ├── overview.md
    ├── event-system.md
    └── extensions.md
```

**Features:**
- [ ] Complete API documentation with examples
- [ ] Getting started guide
- [ ] Custom tools tutorial
- [ ] Storage configuration guide
- [ ] Observability setup guide
- [ ] Deployment guide
- [ ] Examples for all features
- [ ] Architecture documentation
- [ ] Extension guide (plugins, providers, etc.)
- [ ] Migration guide (from Mastra/Indusagi)
- [ ] Troubleshooting guide
- [ ] FAQ
- [ ] JSDoc comments in source code

**Estimated lines:** ~4,000 lines (markdown)

**Priority:** HIGH (needed for adoption)

---

## 📋 Implementation Priority Order

### Priority 1: Core Production Features (Weeks 1-3)
1. ✅ Phase 1: Core Foundation - DONE
2. 🔄 **CLI with Multiple Modes** (Week 1-2)
3. 🔄 **Storage Abstraction** (Week 2)
4. 🔄 **Observability** (Week 2-3)

**Rationale:** These are essential for basic usability and production use.

### Priority 2: UX & Quality (Weeks 4-6)
5. 🔄 **TUI** (Week 4-5)
6. 🔄 **Memory System** (Week 5)
7. 🔄 **Testing Infrastructure** (Week 6)

**Rationale:** Great UX and quality assurance.

### Priority 3: Advanced Features (Weeks 7-10)
8. ⏳ **Workflow Engine** (Week 7-8)
9. ⏳ **MCP Support** (Week 9)
10. ⏳ **Evaluation Framework** (Week 10)

**Rationale:** Nice to have for complex use cases.

11. 🔄 **Full Documentation** (Ongoing, Week 1-10)

**Rationale:** Continuous documentation updates.

---

## 📊 Summary of Remaining Work

```
Phase  Feature              Files     Lines    Priority    Status
------ -------------------- --------- ---------- ----------- ---------
2.1    Storage              5         1,500     HIGH        ⏳ TODO
2.2    Observability         5         1,200     HIGH        ⏳ TODO
2.3    Memory               6         2,000     MEDIUM      ⏳ TODO
2.4    TUI                 10        2,500     MEDIUM      ⏳ TODO
2.5    CLI                  10        2,000     HIGH        ⏳ TODO
3.1    Workflows            5         2,500     MEDIUM      ⏳ TODO
3.2    MCP                  5         1,800     LOW         ⏳ TODO
3.3    Evaluation           6         1,500     LOW         ⏳ TODO
3.4    Testing              20+       3,000     MEDIUM      ⏳ TODO
3.5    Documentation         20+       4,000     HIGH        ⏳ TODO

Total   Remaining             92+       ~21,000    -           ⏳ TODO

Current: 16 files, 5,100 lines (Phase 1)
Target:  108 files, ~26,000 lines (All phases)
```

---

## 🎯 What Makes Framework "Killer"

### Must-Have (MVP)
- ✅ Core Agent - DONE
- ✅ Event System - DONE
- ✅ Model Router - DONE
- ✅ Basic Tools - DONE
- 🔄 CLI - TODO (Priority 1)
- 🔄 Storage - TODO (Priority 1)

### Should-Have (Production Ready)
- 🔄 Observability - TODO (Priority 1)
- 🔄 TUI - TODO (Priority 2)
- 🔄 Memory System - TODO (Priority 2)
- 🔄 Testing - TODO (Priority 2)

### Nice-to-Have (Advanced)
- ⏳ Workflows - TODO (Priority 3)
- ⏳ MCP Support - TODO (Priority 3)
- ⏳ Evaluation - TODO (Priority 3)

---

## 🚀 Next Steps

### Week 1: CLI + Storage Foundation
```bash
# Create CLI structure
mkdir -p src/cli/{modes,commands,utils}

# Implement storage interface
touch src/storage/{base.ts,in-memory.ts}

# Implement interactive mode
touch src/cli/modes/interactive.ts
```

### Week 2: CLI + Storage Complete
```bash
# Complete all CLI modes
touch src/cli/modes/{print.ts,json.ts,rpc.ts}

# Implement file & postgres storage
touch src/storage/{file-storage.ts,postgres.ts}
```

### Week 3: Observability
```bash
# Create observability structure
mkdir -p src/observability

# Implement OpenTelemetry
touch src/observability/{tracer.ts,span.ts,metrics.ts,logger.ts}
```

### Week 4-5: TUI
```bash
# Create TUI structure
mkdir -p src/tui/{panels,components,themes}

# Implement TUI renderer
touch src/tui/{renderer.ts,panels/chat.ts,components/message.ts}
```

---

## 💡 Estimated Timeline

**Current:** 5,100 lines (Phase 1 ✅)
**Week 1-3:** +7,000 lines (CLI + Storage + Observability) = 12,100 lines
**Week 4-5:** +4,500 lines (TUI + Memory) = 16,600 lines
**Week 6:** +3,000 lines (Testing) = 19,600 lines
**Week 7-10:** +6,400 lines (Workflows + MCP + Eval) = 26,000 lines

**Total:** 10 weeks to complete full framework (26,000 lines)

---

## 📈 Progress Tracking

- [x] Phase 1: Core Foundation (5,100 lines)
- [ ] Phase 2: Enhanced Features (11,500 lines)
- [ ] Phase 3: Production Features (9,500 lines)

**Total:** 26,000 lines (25% of Mastra's 276K!)

---

**Last Updated:** March 2, 2026
**Repository:** https://github.com/varunisrani/astra-framework
