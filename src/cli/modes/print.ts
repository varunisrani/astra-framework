/**
 * Print Mode - For scripting and automation
 * Simple stdout output without interactive prompts
 */

import { Agent } from "../../agent/index.js";
import { getBuiltinTools } from "../../tools/index.js";

interface PrintOptions {
  model?: string;
  provider?: string;
  file?: string;
}

export async function printMode(prompt: string, options: PrintOptions) {
  // Create agent
  const agent = new Agent({
    id: "print-agent",
    systemPrompt: "You are a helpful assistant. Be concise.",
    model: options.model || "gpt-4",
    provider: options.provider || "openai",
    tools: getBuiltinTools(),
  });

  // Process file reference if provided
  let finalPrompt = prompt;
  if (options.file) {
    finalPrompt = `@${options.file} ${prompt}`;
    console.log(`📄 Referencing file: ${options.file}`);
  }

  try {
    // Send prompt
    const response = await agent.promptText(finalPrompt);

    // Extract and print response text
    if (response && response.length > 0) {
      const lastMsg = response[response.length - 1];
      if (lastMsg.role === "assistant") {
        const text = lastMsg.content
          .filter((c) => c.type === "text")
          .map((c) => (c as any).text)
          .join("");

        if (text) {
          console.log(text);
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    process.exit(1);
  }
}
