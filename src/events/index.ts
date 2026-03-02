/**
 * Event Bus System
 * From Indusagi - Simple, type-safe event system for extensibility
 */

import type {
  AgentEvent,
  AgentEventType,
  TypedAgentEvent,
} from "../types/index.js";

type Listener<T extends AgentEvent> = (event: T) => void;

/**
 * Simple, type-safe event bus for agent events
 * Based on Indusagi's AgentEventBus
 */
export class EventBus {
  private listeners = new Map<AgentEventType, Set<Listener<any>>>();

  /**
   * Subscribe to events of a specific type
   * Returns an unsubscribe function
   */
  subscribe<T extends AgentEvent>(
    eventType: AgentEventType,
    listener: Listener<T>
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const listeners = this.listeners.get(eventType)!;
    listeners.add(listener);

    // Return unsubscribe function
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Subscribe to all events
   * Returns an unsubscribe function
   */
  subscribeAll(listener: Listener<AgentEvent>): () => void {
    const unsubscribers: Array<() => void> = [];

    for (const eventType of Object.values(this.getAllEventTypes())) {
      const unsubscribe = this.subscribe(eventType, listener as any);
      unsubscribers.push(unsubscribe);
    }

    // Return function to unsubscribe from all
    return () => {
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
    };
  }

  /**
   * Emit an event to all listeners
   */
  emit(event: AgentEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(
            `[EventBus] Error in listener for event "${event.type}":`,
            error
          );
        }
      }
    }
  }

  /**
   * Get all event types that have listeners
   */
  getEventTypes(): AgentEventType[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get count of listeners for a specific event type
   */
  getListenerCount(eventType: AgentEventType): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }

  /**
   * Remove all listeners for a specific event type
   */
  clear(eventType?: AgentEventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get all possible event types
   */
  private getAllEventTypes(): AgentEventType[] {
    return [
      "agent_start",
      "agent_end",
      "turn_start",
      "turn_end",
      "message_start",
      "message_update",
      "message_end",
      "tool_execution_start",
      "tool_execution_end",
      "error",
      "state_change",
      "config_updated",
    ];
  }
}

/**
 * Event Stream for async event handling
 * Based on Indusagi's EventStream
 */
export class EventStream<TEvent, TResult> {
  private listeners = new Set<(event: TEvent) => void>();
  private errorListeners = new Set<(error: Error) => void>();
  private endListeners = new Set<() => void>();
  private isEnded = false;
  private buffer: TEvent[] = [];

  /**
   * Subscribe to events
   */
  on(listener: (event: TEvent) => void): () => void {
    if (this.isEnded) {
      throw new Error("Cannot subscribe to ended stream");
    }

    this.listeners.add(listener);

    // Emit buffered events
    for (const event of this.buffer) {
      listener(event);
    }
    this.buffer = [];

    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to errors
   */
  onError(listener: (error: Error) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  /**
   * Subscribe to stream end
   */
  onEnd(listener: () => void): () => void {
    this.endListeners.add(listener);
    return () => this.endListeners.delete(listener);
  }

  /**
   * Push an event to the stream
   */
  push(event: TEvent): void {
    if (this.isEnded) {
      throw new Error("Cannot push to ended stream");
    }

    if (this.listeners.size === 0) {
      this.buffer.push(event);
      return;
    }

    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        this.emitError(error as Error);
      }
    }
  }

  /**
   * End the stream with a result
   */
  end(result?: TResult): void {
    if (this.isEnded) {
      return;
    }

    this.isEnded = true;

    for (const listener of this.endListeners) {
      try {
        listener();
      } catch (error) {
        console.error("[EventStream] Error in end listener:", error);
      }
    }

    // If we have a result predicate, emit it
    if (result !== undefined) {
      for (const listener of this.listeners) {
        try {
          listener(result as any);
        } catch (error) {
          console.error("[EventStream] Error in result listener:", error);
        }
      }
    }
  }

  /**
   * Emit an error
   */
  error(error: Error): void {
    if (this.isEnded) {
      return;
    }

    this.emitError(error);
    this.end();
  }

  private emitError(error: Error): void {
    for (const listener of this.errorListeners) {
      try {
        listener(error);
      } catch (error2) {
        console.error(
          "[EventStream] Error in error listener:",
          error2
        );
      }
    }
  }

  /**
   * Check if stream is ended
   */
  get isEnded(): boolean {
    return this.isEnded;
  }

  /**
   * Convert to AsyncIterable
   */
  [Symbol.asyncIterator](): AsyncIterator<TEvent> {
    const self = this;
    let resolve: ((value: IteratorResult<TEvent>) => void) | null = null;
    let reject: ((error: Error) => void) | null = null;
    let eventQueue: TEvent[] = [];
    let isDone = false;

    const unsubscribe = this.on((event) => {
      if (resolve) {
        resolve({ value: event, done: false });
        resolve = null;
        reject = null;
      } else {
        eventQueue.push(event);
      }
    });

    const unsubscribeError = this.onError((error) => {
      if (reject) {
        reject(error);
        resolve = null;
        reject = null;
      } else {
        // Store error for next iteration
      }
    });

    const unsubscribeEnd = this.onEnd(() => {
      isDone = true;
      if (resolve) {
        resolve({ value: undefined as any, done: true });
        resolve = null;
        reject = null;
      }
    });

    return {
      async next(): Promise<IteratorResult<TEvent>> {
        return new Promise((res, rej) => {
          resolve = res;
          reject = rej;

          if (eventQueue.length > 0) {
            const event = eventQueue.shift()!;
            resolve({ value: event, done: false });
            resolve = null;
            reject = null;
          } else if (isDone) {
            resolve({ value: undefined as any, done: true });
            resolve = null;
            reject = null;
          }
        });
      },

      async return(): Promise<IteratorResult<TEvent>> {
        unsubscribe();
        unsubscribeError();
        unsubscribeEnd();
        return { value: undefined as any, done: true };
      },

      async throw(error: Error): Promise<IteratorResult<TEvent>> {
        unsubscribe();
        unsubscribeError();
        unsubscribeEnd();
        throw error;
      },
    };
  }
}
