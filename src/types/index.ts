/**
 * Core types for Astra Framework
 * Combines type systems from Indusagi and Mastra
 */

import type { Static, TSchema } from "@sinclair/typebox";
import type { z } from "zod";

// ============================================================================
// Message Types
// ============================================================================

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image";
  image: string; // URL or base64
};

export type ThinkingContent = {
  type: "thinking";
  thinking: string;
};

export type ToolCallContent = {
  type: "toolCall";
  name: string;
  args: Record<string, any>;
  toolCallId: string;
};

export type ToolResultContent = {
  type: "toolResult";
  toolCallId: string;
  result: string | object;
  isError?: boolean;
};

export type ContentBlock =
  | TextContent
  | ImageContent
  | ThinkingContent
  | ToolCallContent
  | ToolResultContent;

export type BaseMessage = {
  role: "user" | "assistant" | "system" | "toolResult";
  content: ContentBlock[];
  timestamp: number;
  id?: string;
};

export interface AssistantMessage extends BaseMessage {
  role: "assistant";
  usage?: {
    input: number;
    output: number;
    total: number;
    cost?: number;
  };
  stopReason?: "stop" | "length" | "error" | "aborted" | "tool_calls";
  model?: string;
  provider?: string;
}

export interface UserMessage extends BaseMessage {
  role: "user";
}

export interface SystemMessage extends BaseMessage {
  role: "system";
}

export interface ToolResultMessage extends BaseMessage {
  role: "toolResult";
  toolCallId: string;
}

export type Message = AssistantMessage | UserMessage | SystemMessage | ToolResultMessage;

// ============================================================================
// Agent Types
// ============================================================================

export type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh";

export interface AgentTool<TSchemaType extends TSchema = TSchema> {
  name: string;
  description: string;
  parameters: TSchemaType;
  handler: (
    args: Static<TSchemaType>,
    context: ToolContext
  ) => Promise<string | object>;
}

export interface ToolContext {
  signal?: AbortSignal;
  agentId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface AgentState {
  id: string;
  systemPrompt: string;
  model: string;
  provider: string;
  thinkingLevel: ThinkingLevel;
  tools: AgentTool<any>[];
  messages: Message[];
  isStreaming: boolean;
  streamMessage: AssistantMessage | null;
  pendingToolCalls: Set<string>;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AgentContext {
  systemPrompt: string;
  messages: Message[];
  tools: AgentTool<any>[];
}

// ============================================================================
// Event Types
// ============================================================================

export type AgentEventType =
  | "agent_start"
  | "agent_end"
  | "turn_start"
  | "turn_end"
  | "message_start"
  | "message_update"
  | "message_end"
  | "tool_execution_start"
  | "tool_execution_end"
  | "error"
  | "state_change"
  | "config_updated";

export interface AgentEvent {
  type: AgentEventType;
  timestamp: number;
  agentId?: string;
  sessionId?: string;
  [key: string]: any;
}

export interface AgentStartEvent extends AgentEvent {
  type: "agent_start";
}

export interface AgentEndEvent extends AgentEvent {
  type: "agent_end";
  messages: Message[];
}

export interface TurnStartEvent extends AgentEvent {
  type: "turn_start";
}

export interface TurnEndEvent extends AgentEvent {
  type: "turn_end";
  message: AssistantMessage;
  toolResults: ToolResultMessage[];
}

export interface MessageStartEvent extends AgentEvent {
  type: "message_start";
  message: Message;
}

export interface MessageUpdateEvent extends AgentEvent {
  type: "message_update";
  message: AssistantMessage;
}

export interface MessageEndEvent extends AgentEvent {
  type: "message_end";
  message: Message;
}

export interface ToolExecutionStartEvent extends AgentEvent {
  type: "tool_execution_start";
  toolCallId: string;
  toolName: string;
  args: Record<string, any>;
}

export interface ToolExecutionEndEvent extends AgentEvent {
  type: "tool_execution_end";
  toolCallId: string;
  toolName: string;
  result: string | object;
  duration: number;
  error?: string;
}

export interface ErrorEvent extends AgentEvent {
  type: "error";
  error: Error;
  message?: string;
}

export type TypedAgentEvent =
  | AgentStartEvent
  | AgentEndEvent
  | TurnStartEvent
  | TurnEndEvent
  | MessageStartEvent
  | MessageUpdateEvent
  | MessageEndEvent
  | ToolExecutionStartEvent
  | ToolExecutionEndEvent
  | ErrorEvent;

// ============================================================================
// Model Types
// ============================================================================

export interface ModelCapabilities {
  streaming?: boolean;
  vision?: boolean;
  thinking?: boolean;
  jsonMode?: boolean;
  maxTokens?: number;
  supportsTools?: boolean;
}

export interface ModelConfig {
  id: string;
  provider: string;
  displayName?: string;
  capabilities: ModelCapabilities;
  pricing?: {
    input?: number; // per 1M tokens
    output?: number; // per 1M tokens
    thinking?: number; // per 1M tokens (if applicable)
  };
}

export interface ModelRequirements {
  capabilities?: Array<keyof ModelCapabilities>;
  maxCost?: number;
  maxTokens?: number;
  provider?: string;
}

export interface StreamOptions {
  signal?: AbortSignal;
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

// ============================================================================
// Storage Types
// ============================================================================

export interface StorageBackend {
  saveState(agentId: string, state: AgentState): Promise<void>;
  loadState(agentId: string): Promise<AgentState | null>;
  deleteState(agentId: string): Promise<void>;
  listStates(agentId?: string): Promise<string[]>;
}

export interface StorageConfig {
  type: "memory" | "file" | "postgres" | "custom";
  connectionString?: string;
  basePath?: string;
  options?: Record<string, any>;
}

// ============================================================================
// Observability Types
// ============================================================================

export interface ObservabilityConfig {
  enabled?: boolean;
  otel?: {
    endpoint?: string;
    serviceName?: string;
    serviceVersion?: string;
    headers?: Record<string, string>;
  };
  logging?: {
    level?: "debug" | "info" | "warn" | "error";
    console?: boolean;
    file?: string;
  };
}

export interface SpanContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
}

export interface SpanMetadata {
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, any>;
  events: Array<{ name: string; timestamp: number; attributes: Record<string, any> }>;
  status?: { code: number; message: string };
}

// ============================================================================
// Memory Types
// ============================================================================

export interface WorkingMemory {
  prune(messages: Message[], maxTokens: number): Promise<Message[]>;
  prioritize(messages: Message[]): Message[];
}

export interface SemanticMemory {
  retrieve(messages: Message[], topK?: number): Promise<Message[]>;
  store(message: Message): Promise<void>;
  search(query: string, topK?: number): Promise<Message[]>;
}

export interface MemoryConfig {
  workingMemory?: {
    maxTokens?: number;
    strategy?: "recency" | "relevance" | "custom";
  };
  semanticMemory?: {
    enabled: boolean;
    vectorStore: string; // "pgvector", "chroma", etc.
    embeddingModel: string;
    topK?: number;
  };
}

// ============================================================================
// Workflow Types
// ============================================================================

export interface WorkflowStep<TInput = any, TOutput = any> {
  id: string;
  name: string;
  execute: (input: TInput, context: WorkflowContext) => Promise<TOutput>;
  timeout?: number;
  retries?: number;
}

export interface WorkflowContext {
  state: Record<string, any>;
  signal?: AbortSignal;
  metadata?: Record<string, any>;
}

export interface WorkflowConfig<TInput = any, TOutput = any> {
  id: string;
  name: string;
  steps: WorkflowStep<TInput, any>[];
  initial?: TInput;
  onError?: (error: Error, context: WorkflowContext) => void;
  onComplete?: (result: TOutput, context: WorkflowContext) => void;
}

export interface WorkflowTransition {
  from: string;
  to: string | string[];
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  steps: Map<string, WorkflowStep>;
  transitions: WorkflowTransition[];
}

// ============================================================================
// Evaluation Types
// ============================================================================

export interface Evaluator<T = any> {
  id: string;
  name: string;
  description: string;
  evaluate: (input: EvaluationInput<T>) => Promise<EvaluationResult>;
}

export interface EvaluationInput<T = any> {
  agentOutput: any;
  expected: any;
  input?: any;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EvaluationResult {
  score: number;
  passed: boolean;
  feedback?: string;
  metadata?: Record<string, any>;
}

export interface DatasetItem {
  id: string;
  input: any;
  expected: any;
  metadata?: Record<string, any>;
}

export interface EvaluationConfig {
  dataset: DatasetItem[];
  evaluators: Evaluator[];
  parallel?: boolean;
  onProgress?: (progress: number, total: number) => void;
}

export interface EvaluationReport {
  totalItems: number;
  passedItems: number;
  failedItems: number;
  averageScore: number;
  results: Array<{
    item: DatasetItem;
    evaluators: Record<string, EvaluationResult>;
  }>;
  duration: number;
}

// ============================================================================
// MCP Types
// ============================================================================

export interface MCPServerConfig {
  name: string;
  version: string;
  capabilities: {
    tools: boolean;
    resources: boolean;
    prompts: boolean;
  };
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

// ============================================================================
// CLI Types
// ============================================================================

export interface CLIMode {
  interactive: boolean;
  print: boolean;
  json: boolean;
  rpc: boolean;
}

export interface CLIConfig {
  mode: CLIMode;
  input?: string;
  files?: string[];
  configPath?: string;
  outputPath?: string;
  verbose?: boolean;
}

export interface CLICommand {
  name: string;
  description: string;
  handler: (args: string[], config: CLIConfig) => Promise<void>;
}

// ============================================================================
// Plugin Types
// ============================================================================

export interface Plugin {
  name: string;
  version: string;
  description?: string;
  install?: (agent: any) => void | Promise<void>;
  uninstall?: (agent: any) => void | Promise<void>;
}

export interface PluginConfig {
  plugins: Plugin[];
}
