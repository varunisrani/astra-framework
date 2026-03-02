/**
 * Astra Framework - Basic Example
 * Demonstrates core features: Agent, Tools, Events, Steering/Follow-Up
 */

import { Agent, getBuiltinTools } from "./src/index.js";

// Create an agent with built-in tools
const agent = new Agent({
  id: "example-agent",
  systemPrompt: "You are a helpful coding assistant.",
  model: "gpt-4",
  provider: "openai",
  tools: getBuiltinTools(),
});

console.log("=== Astra Framework Example ===\n");

// Subscribe to events for real-time updates
agent.events.subscribe("message_start", (event) => {
  console.log(`📝 Message started`);
});

agent.events.subscribe("tool_execution_start", (event) => {
  console.log(`🔧 Tool executing: ${event.toolName}`);
});

agent.events.subscribe("turn_end", (event) => {
  console.log(`✅ Turn ended with ${event.toolResults.length} tool result(s)\n`);
});

agent.events.subscribe("agent_end", (event) => {
  console.log(`🏁 Agent ended with ${event.messages.length} total messages`);
});

// Example 1: Simple prompt
console.log("--- Example 1: Simple Prompt ---");
try {
  await agent.promptText("What is 2 + 2?");
} catch (error) {
  console.log("Note: Model call not implemented yet, this is a demo");
}

// Example 2: Steering messages
console.log("\n--- Example 2: Steering Messages ---");
console.log("Simulating: Send a steering message to interrupt agent");

agent.steer({
  role: "user",
  content: [{ type: "text", text: "Stop and read the README file instead" }],
  timestamp: Date.now(),
});

// Example 3: Follow-up messages
console.log("\n--- Example 3: Follow-Up Messages ---");
console.log("Simulating: Queue multiple tasks to run after agent finishes");

agent.setFollowUpMode("all");
agent.followUp({
  role: "user",
  content: [{ type: "text", text: "Summarize the code" }],
  timestamp: Date.now(),
});

agent.followUp({
  role: "user",
  content: [{ type: "text", text: "Add comments" }],
  timestamp: Date.now(),
});

console.log("\nQueued 2 follow-up messages");
console.log("\nNote: This is a framework demo. Model calls require API keys.");
console.log("See README.md for setup instructions.");

// Export for testing
export { agent };
