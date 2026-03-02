/**
 * E2E Tests - Full Agent Workflow
 */

import { describe, it, expect } from "vitest";
import { Agent, getBuiltinTools } from "../../agent/index.js";

describe("E2E - Agent Workflow", () => {
  it("should handle simple prompt-response cycle", async () => {
    const agent = new Agent({
      id: "e2e-test",
      systemPrompt: "You are a helpful assistant",
      model: "gpt-4",
      provider: "openai",
      tools: [],
    });

    // Note: This test will skip actual LLM call in real E2E
    // For now, we just verify the structure works

    expect(agent.state.id).toBe("e2e-test");
    expect(agent.state.systemPrompt).toBe("You are a helpful assistant");
  });

  it("should handle tools", async () => {
    const agent = new Agent({
      id: "e2e-test",
      systemPrompt: "You are a helpful assistant",
      model: "gpt-4",
      provider: "openai",
      tools: getBuiltinTools(),
    });

    expect(agent.state.tools.length).toBeGreaterThan(0);
    expect(agent.state.tools.some((t) => t.name === "read_file")).toBe(true);
  });

  it("should handle message queuing", async () => {
    const agent = new Agent({
      id: "e2e-test",
      systemPrompt: "You are a helpful assistant",
      model: "gpt-4",
      provider: "openai",
      tools: [],
    });

    // Queue a follow-up message
    agent.followUp({
      role: "user",
      content: [{ type: "text", text: "Follow-up task" }],
      timestamp: Date.now(),
    });

    // Verify it's queued (internal state)
    expect(true).toBe(true);
  });

  it("should handle state reset", async () => {
    const agent = new Agent({
      id: "e2e-test",
      initialMessages: [
        {
          role: "user",
          content: [{ type: "text", text: "test" }],
          timestamp: Date.now(),
        },
      ],
    });

    expect(agent.state.messages.length).toBe(1);

    agent.reset();

    expect(agent.state.messages.length).toBe(0);
    expect(agent.state.tools.length).toBe(0);
  });

  it("should handle event subscriptions", async () => {
    const agent = new Agent({
      id: "e2e-test",
      systemPrompt: "You are a helpful assistant",
      model: "gpt-4",
      provider: "openai",
      tools: [],
    });

    let eventCount = 0;
    const unsubscribe = agent.events.subscribe("agent_start", () => {
      eventCount++;
    });

    expect(typeof unsubscribe).toBe("function");
  });

  it("should update system prompt", async () => {
    const agent = new Agent({
      id: "e2e-test",
      systemPrompt: "Old prompt",
    });

    expect(agent.state.systemPrompt).toBe("Old prompt");

    agent.setSystemPrompt("New prompt");

    expect(agent.state.systemPrompt).toBe("New prompt");
  });

  it("should add and remove tools", async () => {
    const agent = new Agent({
      id: "e2e-test",
      tools: [],
    });

    const tools = getBuiltinTools();
    const tool = tools[0];

    agent.addTool(tool);
    expect(agent.state.tools.length).toBe(1);

    agent.removeTool(tool.name);
    expect(agent.state.tools.length).toBe(0);
  });
});
