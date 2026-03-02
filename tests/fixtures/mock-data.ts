/**
 * Test Fixtures
 * Mock data and utilities for tests
 */

import type { Message, AgentState } from "../../types/index.js";

/**
 * Mock agent state
 */
export const mockAgentState: AgentState = {
  id: "test-agent",
  systemPrompt: "You are a test assistant",
  model: "gpt-4",
  provider: "openai",
  thinkingLevel: "off",
  tools: [],
  messages: [],
  isStreaming: false,
  streamMessage: null,
  pendingToolCalls: new Set(),
};

/**
 * Mock user message
 */
export const mockUserMessage: Message = {
  role: "user",
  content: [{ type: "text", text: "Hello" }],
  timestamp: Date.now(),
};

/**
 * Mock assistant message
 */
export const mockAssistantMessage: Message = {
  role: "assistant",
  content: [{ type: "text", text: "Hi there!" }],
  timestamp: Date.now(),
};

/**
 * Mock messages for conversation
 */
export const mockConversation: Message[] = [
  mockUserMessage,
  mockAssistantMessage,
];

/**
 * Mock tool result message
 */
export const mockToolResultMessage: Message = {
  role: "toolResult",
  toolCallId: "test-call-id",
  content: [
    {
      type: "toolResult",
      toolCallId: "test-call-id",
      result: "Test result",
    },
  ],
  timestamp: Date.now(),
};

/**
 * Delay helper for async tests
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wait for all promises to resolve
 */
export async function waitForAll<T>(promises: Promise<T>[]): Promise<T[]> {
  return Promise.all(promises);
}
