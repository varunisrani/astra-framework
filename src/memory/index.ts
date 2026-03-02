/**
 * Memory System
 * From Mastra - Context management for agents
 */

import type { Message } from "../types/index.js";

// ============================================================================
// Working Memory
// ============================================================================

export interface WorkingMemoryConfig {
  maxTokens?: number;
  maxMessages?: number;
}

/**
 * Simple working memory implementation
 * Handles context window management
 */
export class WorkingMemory {
  private maxTokens: number;
  private maxMessages: number;

  constructor(config: WorkingMemoryConfig = {}) {
    this.maxTokens = config.maxTokens || 16000;
    this.maxMessages = config.maxMessages || 50;
  }

  /**
   * Estimate token count for a message (simple heuristic)
   */
  private estimateTokens(message: Message): number {
    // Rough estimate: 1 token ≈ 4 characters for English text
    let totalChars = 0;
    for (const block of message.content) {
      if (block.type === "text") {
        totalChars += block.text.length;
      } else if (block.type === "toolCall") {
        totalChars += JSON.stringify(block.args).length;
      }
    }
    return Math.ceil(totalChars / 4);
  }

  /**
   * Prune messages to fit within token limit
   */
  prune(messages: Message[]): Message[] {
    // Start from newest, keep adding until we hit the limit
    const pruned: Message[] = [];
    let currentTokens = 0;

    // Iterate from newest to oldest
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const msgTokens = this.estimateTokens(msg);

      if (currentTokens + msgTokens > this.maxTokens) {
        break;
      }

      pruned.unshift(msg);
      currentTokens += msgTokens;

      // Also limit by message count
      if (pruned.length >= this.maxMessages) {
        break;
      }
    }

    return pruned;
  }

  /**
   * Prioritize messages (keep important ones)
   */
  prioritize(messages: Message[]): Message[] {
    // Simple strategy: Keep system messages and recent user messages
    return messages.filter((msg) => {
      // Always keep system messages
      if (msg.role === "system") return true;

      // Keep recent messages (last 20)
      const recentIndex = messages.length - 20;
      const msgIndex = messages.indexOf(msg);
      return msgIndex >= recentIndex;
    });
  }

  /**
   * Check if context is within limits
   */
  isWithinLimit(messages: Message[]): boolean {
    const totalTokens = messages.reduce((sum, msg) => sum + this.estimateTokens(msg), 0);
    return totalTokens <= this.maxTokens && messages.length <= this.maxMessages;
  }
}

// ============================================================================
// Memory Manager
// ============================================================================

/**
 * Memory manager combining working memory
 */
export class MemoryManager {
  private workingMemory: WorkingMemory;

  constructor(config?: { workingMemory?: WorkingMemoryConfig }) {
    this.workingMemory = new WorkingMemory(config?.workingMemory || {});
  }

  /**
   * Process messages before sending to LLM
   */
  processMessages(messages: Message[]): Message[] {
    let processed = [...messages];

    // Prune if over limit
    if (!this.workingMemory.isWithinLimit(processed)) {
      processed = this.workingMemory.prune(processed);
    }

    // Prioritize
    processed = this.workingMemory.prioritize(processed);

    return processed;
  }

  /**
   * Get memory statistics
   */
  getStats(messages: Message[]): {
    totalTokens: number;
    messageCount: number;
    withinLimit: boolean;
  } {
    const totalTokens = messages.reduce(
      (sum, msg) => sum + this.workingMemory.estimateTokens(msg),
      0
    );

    return {
      totalTokens,
      messageCount: messages.length,
      withinLimit: this.workingMemory.isWithinLimit(messages),
    };
  }
}

/**
 * Default memory manager
 */
export const memoryManager = new MemoryManager();
