/**
 * JSON Mode - For automation and integration
 * Machine-readable JSON output
 */

import { Agent } from "../../agent/index.js";
import { getBuiltinTools } from "../../tools/index.js";
import type { Message } from "../../types/index.js";

interface JsonOptions {
  model?: string;
  provider?: string;
}

export async function jsonMode(prompt: string, options: JsonOptions) {
  // Create agent
  const agent = new Agent({
    id: "json-agent",
    systemPrompt: "You are a helpful assistant.",
    model: options.model || "gpt-4",
    provider: options.provider || "openai",
    tools: getBuiltinTools(),
  });

  try {
    // Send prompt
    const response = await agent.promptText(prompt);

    // Format as JSON
    const output = {
      success: true,
      messages: response.map((msg) => ({
        role: msg.role,
        timestamp: msg.timestamp,
        content: msg.content.map((c) => {
          if (c.type === "text") return { type: "text", text: (c as any).text };
          if (c.type === "toolCall") {
            const tc = c as any;
            return { type: "toolCall", name: tc.name, args: tc.args };
          }
          if (c.type === "toolResult") {
            const tr = c as any;
            return { type: "toolResult", result: tr.result };
          }
          return c;
        }),
      })),
      model: agent.state.model,
      provider: agent.state.provider,
    };

    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    const errorOutput = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
    console.log(JSON.stringify(errorOutput, null, 2));
    process.exit(1);
  }
}
