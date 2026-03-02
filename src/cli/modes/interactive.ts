/**
 * Interactive Mode - Terminal UI
 * Based on Indusagi's TUI system
 */

import { Agent } from "../../agent/index.js";
import { getBuiltinTools } from "../../tools/index.js";
import { createInterface, Interface } from "readline";

interface InteractiveOptions {
  model?: string;
  provider?: string;
}

export async function interactiveMode(options: InteractiveOptions) {
  console.log(`
   ╔═══════════════════════════════════════╗
   ║           Astra Framework v0.1.0            ║
   ║   Next-gen agent framework                  ║
   ╚═══════════════════════════════════════╝
  `);

  // Create agent
  const agent = new Agent({
    id: "interactive-agent",
    systemPrompt: "You are a helpful assistant. Be concise and clear.",
    model: options.model || "gpt-4",
    provider: options.provider || "openai",
    tools: getBuiltinTools(),
  });

  // Subscribe to events for real-time updates
  agent.events.subscribe("message_start", (event) => {
    process.stdout.write("📝 ");
  });

  agent.events.subscribe("tool_execution_start", (event) => {
    process.stdout.write(`🔧 ${event.toolName}... `);
  });

  agent.events.subscribe("tool_execution_end", (event) => {
    process.stdout.write("✅\n");
  });

  agent.events.subscribe("agent_end", (event) => {
    process.stdout.write("\n✨ Done!\n");
  });

  // Create readline interface
  const rl: Interface = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "❯ ",
  });

  console.log("\nType your message and press Enter. Ctrl+C to exit.\n");

  // Handle user input
  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const response = await agent.promptText(line);

      // Display assistant response
      if (response && response.length > 0) {
        const lastMsg = response[response.length - 1];
        if (lastMsg.role === "assistant") {
          const text = lastMsg.content
            .filter((c) => c.type === "text")
            .map((c) => (c as any).text)
            .join("");

          if (text) {
            console.log(`\n🤖 ${text}\n`);
          }
        }
      }
    } catch (error) {
      console.error(`\n❌ Error: ${error}\n`);
    }
  }

  rl.close();
}
