/**
 * Core Agent Class
 * Combines Indusagi's elegant architecture with Mastra's production features
 */

import type {
  AgentState,
  AgentTool,
  Message,
  AgentContext,
  ThinkingLevel,
} from "../types/index.js";
import { EventBus } from "../events/index.js";
import { StateManager } from "../utils/state-manager.js";
import { ModelRouter } from "../models/router.js";
import { AgentLoop } from "./loop.js";

/**
 * Configuration for agent creation
 */
export interface AgentConfig {
  id: string;
  systemPrompt?: string;
  model?: string;
  provider?: string;
  thinkingLevel?: ThinkingLevel;
  tools?: AgentTool<any>[];
  initialMessages?: Message[];
  metadata?: Record<string, any>;

  // Optional: Storage backend
  storage?: any; // Will be typed properly when storage is implemented

  // Optional: Observability
  observability?: any; // Will be typed properly when observability is implemented

  // Optional: Memory system
  memory?: any; // Will be typed properly when memory is implemented

  // Message queue modes
  steeringMode?: "all" | "one-at-a-time";
  followUpMode?: "all" | "one-at-a-time";

  // Optional: Custom model router
  modelRouter?: ModelRouter;
}

/**
 * Main Agent class
 * Based on Indusagi's Agent with Mastra's production features
 */
export class Agent {
  private stateManager: StateManager;
  private eventBus: EventBus;
  private modelRouter: ModelRouter;
  private steeringQueue: Message[] = [];
  private followUpQueue: Message[] = [];
  private steeringMode: "all" | "one-at-a-time" = "one-at-a-time";
  private followUpMode: "all" | "one-at-a-time" = "one-at-a-time";
  private abortController?: AbortController;
  private isRunning = false;

  constructor(private config: AgentConfig) {
    // Initialize event bus
    this.eventBus = new EventBus();

    // Initialize state
    const initialState: AgentState = {
      id: config.id,
      systemPrompt: config.systemPrompt || "",
      model: config.model || "gpt-4",
      provider: config.provider || "openai",
      thinkingLevel: config.thinkingLevel || "off",
      tools: config.tools || [],
      messages: config.initialMessages || [],
      isStreaming: false,
      streamMessage: null,
      pendingToolCalls: new Set(),
      metadata: config.metadata,
    };

    // Initialize state manager with event bus
    this.stateManager = new StateManager(initialState, this.eventBus);

    // Initialize model router
    this.modelRouter = config.modelRouter || new ModelRouter();

    // Set queue modes
    this.steeringMode = config.steeringMode || "one-at-a-time";
    this.followUpMode = config.followUpMode || "one-at-a-time";
  }

  // ========================================================================
  // Public API
  // ========================================================================

  /**
   * Get current agent state
   */
  get state(): AgentState {
    return this.stateManager.state;
  }

  /**
   * Get event bus for subscribing to events
   */
  get events(): EventBus {
    return this.eventBus;
  }

  /**
   * Send a prompt to the agent
   */
  async prompt(message: Message | Message[]): Promise<Message[]> {
    if (this.isRunning) {
      throw new Error("Agent is already running. Use steer() or followUp() to queue messages.");
    }

    const messages = Array.isArray(message) ? message : [message];
    return await this._run(messages);
  }

  /**
   * Send a text prompt (convenience method)
   */
  async promptText(text: string): Promise<Message[]> {
    const message: Message = {
      role: "user",
      content: [{ type: "text", text }],
      timestamp: Date.now(),
    };
    return await this.prompt(message);
  }

  /**
   * Interrupt the agent mid-execution with a steering message
   */
  steer(message: Message): void {
    this.steeringQueue.push(message);
  }

  /**
   * Queue a follow-up message to be processed after agent finishes
   */
  followUp(message: Message): void {
    this.followUpQueue.push(message);
  }

  /**
   * Clear all queued messages
   */
  clearQueues(): void {
    this.steeringQueue = [];
    this.followUpQueue = [];
  }

  /**
   * Abort current execution
   */
  abort(): void {
    this.abortController?.abort();
  }

  /**
   * Wait for agent to finish
   */
  async waitForIdle(): Promise<void> {
    while (this.isRunning) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  /**
   * Reset agent state
   */
  reset(): void {
    this.stateManager.reset();
    this.clearQueues();
  }

  // ========================================================================
  // State Mutators
  // ========================================================================

  /**
   * Set system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.stateManager.setSystemPrompt(prompt);
  }

  /**
   * Set model
   */
  setModel(model: string, provider?: string): void {
    this.stateManager.setModel(model, provider || this.state.provider);
  }

  /**
   * Set thinking level
   */
  setThinkingLevel(level: ThinkingLevel): void {
    this.stateManager.setThinkingLevel(level);
  }

  /**
   * Set tools
   */
  setTools(tools: AgentTool<any>[]): void {
    this.stateManager.setTools(tools);
  }

  /**
   * Add a tool
   */
  addTool(tool: AgentTool<any>): void {
    const tools = [...this.state.tools, tool];
    this.stateManager.setTools(tools);
  }

  /**
   * Remove a tool by name
   */
  removeTool(toolName: string): void {
    const tools = this.state.tools.filter((t) => t.name !== toolName);
    this.stateManager.setTools(tools);
  }

  /**
   * Set steering mode
   */
  setSteeringMode(mode: "all" | "one-at-a-time"): void {
    this.steeringMode = mode;
  }

  /**
   * Set follow-up mode
   */
  setFollowUpMode(mode: "all" | "one-at-a-time"): void {
    this.followUpMode = mode;
  }

  // ========================================================================
  // Event Subscription
  // ========================================================================

  /**
   * Subscribe to agent events
   */
  on(eventType: string, listener: (event: any) => void): () => void {
    return this.eventBus.subscribe(eventType, listener);
  }

  /**
   * Subscribe to all events
   */
  onAll(listener: (event: any) => void): () => void {
    return this.eventBus.subscribeAll(listener);
  }

  // ========================================================================
  // Private Methods
  // ========================================================================

  /**
   * Run the agent loop
   */
  private async _run(initialMessages: Message[]): Promise<Message[]> {
    this.isRunning = true;
    this.abortController = new AbortController();

    this.eventBus.emit({
      type: "agent_start",
      timestamp: Date.now(),
      agentId: this.state.id,
    });

    try {
      const context: AgentContext = {
        systemPrompt: this.state.systemPrompt,
        messages: [...this.state.messages, ...initialMessages],
        tools: this.state.tools,
      };

      const loop = new AgentLoop({
        context,
        eventBus: this.eventBus,
        modelRouter: this.modelRouter,
        signal: this.abortController.signal,
        getSteeringMessages: this.getSteeringMessages.bind(this),
        getFollowUpMessages: this.getFollowUpMessages.bind(this),
        stateManager: this.stateManager,
      });

      const finalMessages = await loop.run();

      this.eventBus.emit({
        type: "agent_end",
        timestamp: Date.now(),
        agentId: this.state.id,
        messages: finalMessages,
      });

      return finalMessages;
    } catch (error) {
      this.eventBus.emit({
        type: "error",
        timestamp: Date.now(),
        agentId: this.state.id,
        error,
      });

      throw error;
    } finally {
      this.isRunning = false;
      this.abortController = undefined;
    }
  }

  /**
   * Get steering messages (for interrupting agent)
   */
  private getSteeringMessages(): Message[] {
    if (this.steeringMode === "one-at-a-time") {
      if (this.steeringQueue.length > 0) {
        const message = this.steeringQueue.shift()!;
        return [message];
      }
      return [];
    } else {
      const messages = this.steeringQueue.slice();
      this.steeringQueue = [];
      return messages;
    }
  }

  /**
   * Get follow-up messages (for chaining tasks)
   */
  private getFollowUpMessages(): Message[] {
    if (this.followUpMode === "one-at-a-time") {
      if (this.followUpQueue.length > 0) {
        const message = this.followUpQueue.shift()!;
        return [message];
      }
      return [];
    } else {
      const messages = this.followUpQueue.slice();
      this.followUpQueue = [];
      return messages;
    }
  }
}
