/**
 * Astra Framework - Main Entry Point
 * Next-generation agent framework combining best of Mastra and Indusagi
 */

// ============================================================================
// Core Agent
// ============================================================================

export { Agent } from "./agent/index.js";
export { AgentLoop } from "./agent/loop.js";
export type { AgentConfig } from "./agent/index.js";

// ============================================================================
// Events
// ============================================================================

export { EventBus, EventStream } from "./events/index.js";

// ============================================================================
// Types
// ============================================================================

export * from "./types/index.js";

// ============================================================================
// Tools
// ============================================================================

export * from "./tools/index.js";

// ============================================================================
// Models
// ============================================================================

export {
  ModelRouter,
  OpenAIProvider,
  AnthropicProvider,
  CostRoutingStrategy,
} from "./models/router.js";
export type {
  ProviderAdapter,
  RoutingStrategy,
} from "./models/router.js";

// ============================================================================
// Utils
// ============================================================================

export { StateManager } from "./utils/state-manager.js";
