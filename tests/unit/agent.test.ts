/**
 * Unit Tests - Agent
 */

import { describe, it, expect } from "vitest";
import { Agent } from "../../agent/index.js";
import { getBuiltinTools } from "../../tools/index.js";

describe("Agent", () => {
  it("should create an agent with default config", () => {
    const agent = new Agent({
      id: "test-agent",
      systemPrompt: "You are a test assistant",
    });

    expect(agent.state.id).toBe("test-agent");
    expect(agent.state.systemPrompt).toBe("You are a test assistant");
    expect(agent.state.tools.length).toBe(0);
    expect(agent.state.messages.length).toBe(0);
  });

  it("should create an agent with tools", () => {
    const tools = getBuiltinTools();
    const agent = new Agent({
      id: "test-agent",
      tools: tools,
    });

    expect(agent.state.tools.length).toBe(tools.length);
  });

  it("should update system prompt", () => {
    const agent = new Agent({
      id: "test-agent",
      systemPrompt: "Old prompt",
    });

    agent.setSystemPrompt("New prompt");

    expect(agent.state.systemPrompt).toBe("New prompt");
  });

  it("should add a tool", () => {
    const agent = new Agent({
      id: "test-agent",
    });

    const tool = getBuiltinTools()[0];
    agent.addTool(tool);

    expect(agent.state.tools.length).toBe(1);
    expect(agent.state.tools[0].name).toBe(tool.name);
  });

  it("should remove a tool by name", () => {
    const agent = new Agent({
      id: "test-agent",
      tools: getBuiltinTools(),
    });

    const toolName = agent.state.tools[0].name;
    agent.removeTool(toolName);

    expect(agent.state.tools.find((t) => t.name === toolName)).toBeUndefined();
  });

  it("should clear messages", () => {
    const agent = new Agent({
      id: "test-agent",
      initialMessages: [
        {
          role: "user",
          content: [{ type: "text", text: "test" }],
          timestamp: Date.now(),
        },
      ],
    });

    expect(agent.state.messages.length).toBe(1);

    agent.clearMessages();

    expect(agent.state.messages.length).toBe(0);
  });

  it("should set follow-up mode", () => {
    const agent = new Agent({
      id: "test-agent",
    });

    agent.setFollowUpMode("all");
    // Mode is internal, just test it doesn't throw
    expect(true).toBe(true);
  });
});
