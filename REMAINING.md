# What's Remaining for Astra Framework

## 📊 Quick Summary

**Current Status:** Phase 1 Complete ✅
**Files:** 16 files
**Lines:** ~5,100 lines
**Target:** ~26,000 lines (all phases complete)

---

## 🚧 What's Left to Build (TODO)

### Phase 2: Enhanced Features (Weeks 1-5)

#### 1. CLI with Multiple Modes ⏳ (HIGH PRIORITY)
```
📂 src/cli/
├── cli.ts                    # Main CLI entry point
├── modes/
│   ├── interactive.ts         # Interactive mode (with TUI)
│   ├── print.ts             # Print mode (stdout)
│   ├── json.ts              # JSON mode (machine-readable)
│   └── rpc.ts               # RPC mode (process integration)
├── commands/
│   ├── login.ts             # Set API keys
│   ├── config.ts            # Config management
│   └── session.ts           # Session management
└── utils/
    ├── prompt.ts            # Interactive prompts
    └── output.ts           # Output formatting
```
**Estimated:** 2,000 lines
**Features:**
- Interactive TUI mode
- Print mode for scripting
- JSON mode for automation
- RPC mode for process integration
- File-aware prompts (@file syntax)
- Session management
- Command history

#### 2. Storage Abstraction ⏳ (HIGH PRIORITY)
```
📂 src/storage/
├── base.ts                   # Storage interface
├── in-memory.ts              # Default in-memory
├── file-storage.ts            # File-based (JSON)
└── postgres.ts                # PostgreSQL backend
```
**Estimated:** 1,500 lines
**Features:**
- In-memory storage (default)
- File-based storage (JSON)
- PostgreSQL storage (production)
- State serialization
- Migration support

#### 3. Observability (OpenTelemetry) ⏳ (HIGH PRIORITY)
```
📂 src/observability/
├── tracer.ts                 # OpenTelemetry tracer
├── span.ts                   # Span management
├── metrics.ts                # Metrics collection
└── logger.ts                 # Structured logging
```
**Estimated:** 1,200 lines
**Features:**
- OpenTelemetry integration
- Span tracking for all operations
- Metrics (duration, tokens, cost)
- Structured logging (debug/info/warn/error)
- Export to Jaeger, Datadog, etc.

#### 4. Memory System ⏳ (MEDIUM PRIORITY)
```
📂 src/memory/
├── working.ts                # Working memory (pruning)
├── semantic.ts               # Semantic memory (vectors)
├── vector-stores/
│   ├── base.ts              # Vector store interface
│   ├── pgvector.ts          # PostgreSQL vectors
│   └── memory.ts            # In-memory vectors
└── embeddings/
    ├── base.ts              # Embedding interface
    ├── openai.ts           # OpenAI embeddings
    └── local.ts             # Local embeddings
```
**Estimated:** 2,000 lines
**Features:**
- Working memory with context pruning
- Semantic memory with vector search
- Embedding providers (OpenAI, local)
- Vector stores (pgvector, in-memory)
- Top-K retrieval

#### 5. TUI (Terminal UI) ⏳ (MEDIUM PRIORITY)
```
📂 src/tui/
├── renderer.ts               # TUI rendering engine
├── panels/
│   ├── chat.ts              # Chat panel
│   ├── tools.ts             # Tools panel
│   └── status.ts            # Status panel
├── components/
│   ├── message.ts           # Message component
│   ├── code.ts              # Code blocks
│   └── thinking.ts          # Thinking blocks
└── themes/
    ├── default.ts            # Default theme
    └── dracula.ts           # Dracula theme
```
**Estimated:** 2,500 lines
**Features:**
- Beautiful terminal UI (Blessed)
- Real-time message streaming
- Markdown rendering
- Syntax highlighting
- Command palette (Ctrl+P)
- Theme support

---

### Phase 3: Production Features (Weeks 6-10)

#### 6. Workflow Engine ⏳ (MEDIUM PRIORITY)
```
📂 src/workflows/
├── workflow.ts               # Workflow class
├── step.ts                   # Step class
├── graph.ts                  # Graph orchestration
└── suspend/
    ├── manager.ts            # Suspend/resume
    └── storage.ts           # State storage
```
**Estimated:** 2,500 lines
**Features:**
- Sequential execution (.then())
- Parallel execution (.parallel())
- Branching (.branch())
- Human-in-the-loop (suspend/resume)

#### 7. MCP Support ⏳ (LOW PRIORITY)
```
📂 src/mcp/
├── server.ts                 # MCP server
├── client.ts                 # MCP client
├── tools.ts                  # Tool exposure
└── registry.ts               # MCP registry
```
**Estimated:** 1,800 lines
**Features:**
- Expose tools as MCP
- Consume external MCP
- JSON-RPC 2.0
- Registry and discovery

#### 8. Evaluation Framework ⏳ (LOW PRIORITY)
```
📂 src/evals/
├── evaluator.ts             # Evaluator base
├── scorers/
│   ├── accuracy.ts         # Accuracy scorer
│   ├── relevance.ts        # Relevance scorer
│   └── custom.ts          # Custom scorer
├── dataset.ts               # Dataset management
└── report.ts               # Report generation
```
**Estimated:** 1,500 lines
**Features:**
- Built-in evaluators
- Custom evaluator support
- Dataset management
- Report generation (JSON, HTML)

#### 9. Testing Infrastructure ⏳ (MEDIUM PRIORITY)
```
📂 tests/
├── unit/                     # Unit tests (80%+ coverage)
├── integration/              # Integration tests
├── e2e/                      # End-to-end tests
└── fixtures/                 # Test data
```
**Estimated:** 3,000 lines
**Features:**
- Unit tests for all modules
- Integration tests
- E2E tests
- CI/CD (GitHub Actions)
- Coverage reporting

#### 10. Full Documentation ⏳ (HIGH PRIORITY)
```
📂 docs/
├── api/                       # API docs
├── guides/                    # User guides
├── examples/                   # Code examples
└── architecture/               # Architecture docs
```
**Estimated:** 4,000 lines
**Features:**
- Complete API documentation
- Getting started guide
- Custom tools tutorial
- Deployment guide
- Examples for all features

---

## 📋 Summary Table

| # | Feature               | Priority   | Est. Lines | Status  |
|---|-----------------------|------------|------------|---------|
| 1 | CLI with Modes        | HIGH       | 2,000      | ⏳ TODO |
| 2 | Storage              | HIGH       | 1,500      | ⏳ TODO |
| 3 | Observability         | HIGH       | 1,200      | ⏳ TODO |
| 4 | Memory               | MEDIUM     | 2,000      | ⏳ TODO |
| 5 | TUI                  | MEDIUM     | 2,500      | ⏳ TODO |
| 6 | Workflows            | MEDIUM     | 2,500      | ⏳ TODO |
| 7 | MCP Support           | LOW        | 1,800      | ⏳ TODO |
| 8 | Evaluation           | LOW        | 1,500      | ⏳ TODO |
| 9 | Testing              | MEDIUM     | 3,000      | ⏳ TODO |
| 10 | Full Documentation    | HIGH       | 4,000      | ⏳ TODO |
|    |                      |            |            |         |
| **Total** | **Remaining** | -          | **~21,000** | **TODO** |

---

## 🎯 What's Needed for MVP (Minimum Viable Product)

To have a **usable framework**, you need:

### ✅ Already Done:
- [x] Core Agent
- [x] Event System
- [x] Model Router
- [x] Basic Tools
- [x] Type System

### 🔄 To Add (Priority Order):
1. 🔄 **CLI** - Essential for usability
2. 🔄 **Storage** - Essential for persistence
3. 🔄 **Observability** - Essential for debugging
4. 🔄 **Testing** - Essential for quality
5. 🔄 **Documentation** - Essential for adoption

### ⏳ Nice to Have (Later):
- TUI (great UX but not essential)
- Memory (improves quality but not essential)
- Workflows (complex use cases)
- MCP (ecosystem feature)
- Evaluation (testing feature)

---

## 📈 Estimated Timeline

### Week 1-3: Essential Production Features
- Week 1: CLI (interactive + print modes)
- Week 2: CLI (JSON + RPC) + Storage
- Week 3: Observability

**Result:** Usable framework ✅

### Week 4-5: UX & Quality
- Week 4: TUI
- Week 5: Memory + Testing

**Result:** Great UX + production quality ✅

### Week 6-10: Advanced Features
- Week 6-7: Workflows
- Week 8: MCP
- Week 9: Evaluation
- Week 10: Full documentation

**Result:** Full-featured framework ✅

---

## 🚀 Quick Start for Next Steps

### Option 1: Build CLI First (Recommended)

```bash
cd /home/clawdbot/.indusclaw/workspace/astra-framework

# Create CLI structure
mkdir -p src/cli/{modes,commands,utils}

# Start with interactive mode
cat > src/cli/modes/interactive.ts << 'EOF'
// Interactive TUI mode
export async function interactiveMode(config) {
  // TODO: Implement
}
EOF

# Build and test
npm run build
npx tsx src/cli/modes/interactive.ts
```

### Option 2: Build Storage First

```bash
cd /home/clawdbot/.indusclaw/workspace/astra-framework

# Create storage files
cat > src/storage/in-memory.ts << 'EOF'
// In-memory storage implementation
export class InMemoryStorage {
  // TODO: Implement
}
EOF

# Add to exports
echo "export * from './storage/in-memory.js';" >> src/index.ts
```

### Option 3: Clone Existing Code

You can copy/paste from:
- **Indusagi CLI**: `indusagi-coding-agent/src/` for CLI
- **Mastra Storage**: `mastra/packages/core/src/storage/` for storage
- **Mastra Observability**: `mastra/packages/core/src/observability/` for otel
- **Mastra Memory**: `mastra/packages/core/src/memory/` for memory

---

## 💡 Tips

1. **Start with CLI** - Most important for usability
2. **Use existing code** - Copy from Indusagi/Mastra where possible
3. **Keep it simple** - Don't over-engineer like Mastra
4. **Test as you go** - Write tests alongside code
5. **Document continuously** - Don't wait until the end

---

**Repository:** https://github.com/varunisrani/astra-framework
**Current:** Phase 1 Complete (5,100 lines) ✅
**Target:** All phases (26,000 lines) ⏳
