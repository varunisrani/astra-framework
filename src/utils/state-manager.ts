/**
 * State Manager
 * From Indusagi - Centralized state management with type safety
 */

import type { AgentState } from "../types/index.js";
import type { EventBus } from "../events/index.js";

/**
 * Manages agent state with immutability and event emission
 */
export class StateManager {
  private _state: AgentState;
  private eventBus?: EventBus;

  constructor(initialState: AgentState, eventBus?: EventBus) {
    this._state = this.cloneState(initialState);
    this.eventBus = eventBus;
  }

  /**
   * Get current state (immutable copy)
   */
  get state(): AgentState {
    return this.cloneState(this._state);
  }

  /**
   * Get state reference (for performance - use carefully)
   */
  get stateRef(): AgentState {
    return this._state;
  }

  /**
   * Update state with partial updates
   */
  update(partial: Partial<AgentState>): void {
    const oldState = this._state;
    this._state = { ...this._state, ...partial };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Set system prompt
   */
  setSystemPrompt(prompt: string): void {
    const oldState = this._state;
    this._state = { ...this._state, systemPrompt: prompt };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Set model
   */
  setModel(model: string, provider: string): void {
    const oldState = this._state;
    this._state = {
      ...this._state,
      model,
      provider,
    };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Set thinking level
   */
  setThinkingLevel(level: typeof this._state.thinkingLevel): void {
    const oldState = this._state;
    this._state = { ...this._state, thinkingLevel: level };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Set tools
   */
  setTools(tools: typeof this._state.tools): void {
    const oldState = this._state;
    this._state = { ...this._state, tools: [...tools] };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Replace all messages
   */
  replaceMessages(messages: typeof this._state.messages): void {
    const oldState = this._state;
    this._state = { ...this._state, messages: [...messages] };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Append a message
   */
  appendMessage(message: typeof this._state.messages[0]): void {
    const oldState = this._state;
    this._state = {
      ...this._state,
      messages: [...this._state.messages, message],
    };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Set streaming state
   */
  setStreaming(isStreaming: boolean): void {
    const oldState = this._state;
    this._state = { ...this._state, isStreaming };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Set stream message
   */
  setStreamMessage(message: typeof this._state.streamMessage): void {
    const oldState = this._state;
    this._state = { ...this._state, streamMessage: message };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Add pending tool call
   */
  addPendingToolCall(toolCallId: string): void {
    const newPending = new Set(this._state.pendingToolCalls);
    newPending.add(toolCallId);

    const oldState = this._state;
    this._state = { ...this._state, pendingToolCalls: newPending };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Remove pending tool call
   */
  removePendingToolCall(toolCallId: string): void {
    const newPending = new Set(this._state.pendingToolCalls);
    newPending.delete(toolCallId);

    const oldState = this._state;
    this._state = { ...this._state, pendingToolCalls: newPending };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Clear pending tool calls
   */
  clearPendingToolCalls(): void {
    const oldState = this._state;
    this._state = { ...this._state, pendingToolCalls: new Set() };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Set error
   */
  setError(error?: string): void {
    const oldState = this._state;
    this._state = { ...this._state, error };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Reset state to initial state
   */
  reset(): void {
    const oldState = this._state;
    this._state = {
      id: this._state.id,
      systemPrompt: "",
      model: this._state.model,
      provider: this._state.provider,
      thinkingLevel: "off",
      tools: [],
      messages: [],
      isStreaming: false,
      streamMessage: null,
      pendingToolCalls: new Set(),
    };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Clear messages
   */
  clearMessages(): void {
    const oldState = this._state;
    this._state = { ...this._state, messages: [] };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Update metadata
   */
  updateMetadata(metadata: Partial<typeof this._state.metadata>): void {
    const oldState = this._state;
    this._state = {
      ...this._state,
      metadata: { ...this._state.metadata, ...metadata },
    };

    this.emitStateChange(oldState, this._state);
  }

  /**
   * Clone state (deep copy for Sets)
   */
  private cloneState(state: AgentState): AgentState {
    return {
      ...state,
      messages: [...state.messages],
      tools: [...state.tools],
      pendingToolCalls: new Set(state.pendingToolCalls),
      streamMessage: state.streamMessage ? { ...state.streamMessage } : null,
      metadata: state.metadata ? { ...state.metadata } : undefined,
    };
  }

  /**
   * Emit state change event
   */
  private emitStateChange(oldState: AgentState, newState: AgentState): void {
    if (this.eventBus) {
      this.eventBus.emit({
        type: "state_change",
        timestamp: Date.now(),
        agentId: oldState.id,
        oldState,
        newState,
      });
    }
  }
}
