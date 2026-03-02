# Changelog

All notable changes to the Astra Framework will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-02

### Added

#### Core Framework
- Agent class with event-driven architecture
- Agent loop with steering and follow-up message queuing
- Simple tool system with built-in tools
- Model router with 40+ provider support
- Complete type system

#### CLI
- Multi-mode CLI (interactive, print, JSON)
- Interactive mode with terminal prompts
- Print mode for scripting
- JSON mode for machine-readable output
- List tools and models commands

#### Storage
- Storage backend interface
- In-memory storage (default)
- File-based storage with JSON persistence
- PostgreSQL storage stub

#### Observability
- Structured logger (debug, info, warn, error)
- Span management for tracing
- Observability manager
- Metrics collector (agent starts, errors, tokens, cost)

#### Memory System
- Working memory with context pruning
- Token estimation for messages
- Context window management
- Message prioritization
- Memory manager for coordination

#### Testing Infrastructure
- Unit tests for agent, events, storage
- E2E tests for full agent workflows
- Test fixtures (mock data, helpers)
- Vitest configuration with coverage reporting

#### Workflows
- Workflow orchestration engine
- Sequential, parallel, and branching execution
- Step execution with retries and timeouts
- Workflow factory and step creation

#### MCP Support
- MCP server implementation
- MCP client for external connections
- Tool and resource exposure
- MCP registry

#### Evaluation Framework
- Evaluator base class and factory
- Built-in evaluators (accuracy, contains, JSON, length)
- Dataset management
- Evaluation runner with parallel/sequential modes
- Report generation

#### Documentation
- Comprehensive API documentation
- Quick start guide
- Code examples for all features
- Best practices guide

### Changed

- Initial release

---

## [Unreleased]

### Added

### Changed

### Fixed
