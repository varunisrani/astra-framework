/**
 * Agent Loop
 * From Indusagi - Clean, elegant loop with steering and follow-up support
 */

import type {
  Message,
  AssistantMessage,
  ToolResultMessage,
  AgentContext,
  AgentTool,
  StreamOptions,
} from "../types/index.js";
import { EventBus } from "../events/index.js";
import { StateManager } from "../utils/state-manager.js";
import { ModelRouter } from "../models/router.js";

/**
 * Configuration for agent loop
 */
export interface AgentLoopConfig {
  context: AgentContext;
  eventBus: EventBus;
  modelRouter: ModelRouter;
  signal?: AbortSignal;
  getSteeringMessages: () => Message[];
  getFollowUpMessages: () => Message[];
  stateManager: StateManager;
}

/**
 * Agent Loop - Core execution engine
 * Based on Indusagi's agent-loop.ts
 */
export class AgentLoop {
  private config: AgentLoopConfig;

  constructor(config: AgentLoopConfig) {
    this.config = config;
  }

  /**
   * Run the agent loop
   */
  async run(): Promise<Message[]> {
    let { context } = this.config;
    const finalMessages: Message[] = [];

    // Outer loop: continues when follow-up messages arrive
    while (true) {
      let hasMoreToolCalls = true;
      let pendingMessages: Message[] = [];

      // Inner loop: process tool calls and steering messages
      while (hasMoreToolCalls || pendingMessages.length > 0) {
        this.config.eventBus.emit({
          type: "turn_start",
          timestamp: Date.now(),
          agentId: context.messages[0]?.id,
        });

        // Process pending messages (inject before next assistant response)
        if (pendingMessages.length > 0) {
          for (const message of pendingMessages) {
            this.config.eventBus.emit({
              type: "message_start",
              timestamp: Date.now(),
              message,
            });

            context.messages.push(message);
            finalMessages.push(message);

            this.config.eventBus.emit({
              type: "message_end",
              timestamp: Date.now(),
              message,
            });
          }
          pendingMessages = [];
        }

        // Stream assistant response
        const assistantMessage = await this.streamAssistantResponse(context);
        context.messages.push(assistantMessage);
        finalMessages.push(assistantMessage);

        // Check for tool calls
        const toolCalls = assistantMessage.content.filter((c) => c.type === "toolCall");
        hasMoreToolCalls = toolCalls.length > 0;

        const toolResults: ToolResultMessage[] = [];
        if (hasMoreToolCalls) {
          for (const toolCall of toolCalls) {
            const result = await this.executeToolCall(toolCall, context.tools);
            toolResults.push(result);
            context.messages.push(result);
            finalMessages.push(result);
          }
        }

        this.config.eventBus.emit({
          type: "turn_end",
          timestamp: Date.now(),
          message: assistantMessage,
          toolResults,
        });

        // Check for steering messages after tool execution
        if (hasMoreToolCalls) {
          const steeringMessages = this.config.getSteeringMessages();
          if (steeringMessages.length > 0) {
            pendingMessages = steeringMessages;
            // Skip remaining tool calls
            hasMoreToolCalls = false;
          }
        }
      }

      // Agent would stop here. Check for follow-up messages.
      const followUpMessages = this.config.getFollowUpMessages();
      if (followUpMessages.length > 0) {
        pendingMessages = followUpMessages;
        continue;
      }

      // No more messages, exit
      break;
    }

    return finalMessages;
  }

  /**
   * Stream assistant response from LLM
   */
  private async streamAssistantResponse(
    context: AgentContext
  ): Promise<AssistantMessage> {
    const startTime = Date.now();

    // Build message for LLM
    const llmMessages = context.messages.map((msg) => {
      // Filter to only user, assistant, toolResult roles
      if (msg.role === "user" || msg.role === "assistant" || msg.role === "toolResult") {
        return {
          role: msg.role,
          content: msg.content.filter((c) => c.type === "text" || c.type === "image"),
          timestamp: msg.timestamp,
        };
      }
      return null;
    }).filter((msg): msg is Message => msg !== null);

    // Get model from router
    const model = this.config.modelRouter.getModel(context);

    // Build options
    const options: StreamOptions = {
      signal: this.config.signal,
    };

    // Start streaming
    this.config.eventBus.emit({
      type: "message_start",
      timestamp: Date.now(),
      message: {
        role: "assistant",
        content: [],
        timestamp: Date.now(),
      } as AssistantMessage,
    });

    let partialMessage: AssistantMessage = {
      role: "assistant",
      content: [],
      timestamp: Date.now(),
      stopReason: "stop",
    };

    try {
      // Simulate streaming (will be replaced with actual LLM call)
      const response = await this.config.modelRouter.generate(
        model,
        {
          systemPrompt: context.systemPrompt,
          messages: llmMessages,
          tools: context.tools,
        },
        options
      );

      // For now, simulate streaming
      partialMessage = response;

      // Emit updates (simulated)
      this.config.eventBus.emit({
        type: "message_update",
        timestamp: Date.now(),
        message: partialMessage,
      });

      // Emit end
      const duration = Date.now() - startTime;
      partialMessage.usage = {
        input: 0,
        output: 0,
        total: 0,
      };

      this.config.eventBus.emit({
        type: "message_end",
        timestamp: Date.now(),
        message: partialMessage,
      });

      return partialMessage;
    } catch (error) {
      const duration = Date.now() - startTime;
      partialMessage.stopReason = "error";

      this.config.eventBus.emit({
        type: "error",
        timestamp: Date.now(),
        error,
      });

      throw error;
    }
  }

  /**
   * Execute a tool call
   */
  private async executeToolCall(
    toolCall: Extract<Extract<typeof this.config.context.messages[number], { role: "assistant" }>["content"][number],
    tools: AgentTool<any>[]
  ): Promise<ToolResultMessage> {
    if (toolCall.type !== "toolCall") {
      throw new Error("Expected toolCall content block");
    }

    const tool = tools.find((t) => t.name === toolCall.name);
    if (!tool) {
      return {
        role: "toolResult",
        toolCallId: toolCall.toolCallId,
        content: [
          {
            type: "toolResult",
            toolCallId: toolCall.toolCallId,
            result: `Tool "${toolCall.name}" not found`,
            isError: true,
          },
        ],
        timestamp: Date.now(),
      };
    }

    this.config.eventBus.emit({
      type: "tool_execution_start",
      timestamp: Date.now(),
      toolCallId: toolCall.toolCallId,
      toolName: toolCall.name,
      args: toolCall.args,
    });

    const startTime = Date.now();

    try {
      const context = {
        signal: this.config.signal,
        agentId: this.config.context.messages[0]?.id,
        sessionId: this.config.context.messages[0]?.id,
      };

      const result = await tool.handler(toolCall.args, context);

      const duration = Date.now() - startTime;

      this.config.eventBus.emit({
        type: "tool_execution_end",
        timestamp: Date.now(),
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.name,
        result,
        duration,
      });

      return {
        role: "toolResult",
        toolCallId: toolCall.toolCallId,
        content: [
          {
            type: "toolResult",
            toolCallId: toolCall.toolCallId,
            result,
          },
        ],
        timestamp: Date.now(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.config.eventBus.emit({
        type: "tool_execution_end",
        timestamp: Date.now(),
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.name,
        result: { error: errorMessage },
        duration,
        error: errorMessage,
      });

      return {
        role: "toolResult",
        toolCallId: toolCall.toolCallId,
        content: [
          {
            type: "toolResult",
            toolCallId: toolCall.toolCallId,
            result: { error: errorMessage },
            isError: true,
          },
        ],
        timestamp: Date.now(),
      };
    }
  }
}
