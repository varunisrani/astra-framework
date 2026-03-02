/**
 * CLI - Main Entry Point
 * Based on Indusagi-coding-agent CLI
 */

import { Command } from "commander";
import { Agent } from "../agent/index.js";
import { getBuiltinTools } from "../tools/index.js";
import { interactiveMode } from "./modes/interactive.js";
import { printMode } from "./modes/print.js";
import { jsonMode } from "./modes/json.js";

const program = new Command();

program
  .name("astra")
  .description("Next-generation agent framework combining best of Mastra and Indusagi")
  .version("0.1.0");

// Interactive mode (default)
program
  .command("interactive", { isDefault: true })
  .description("Start interactive TUI mode")
  .option("-m, --model <model>", "Model to use (e.g., gpt-4, claude-3-opus)")
  .option("-p, --provider <provider>", "Provider to use (e.g., openai, anthropic)")
  .action(async (options) => {
    await interactiveMode(options);
  });

// Print mode
program
  .command("print")
  .description("Print mode for scripting (stdout output)")
  .argument("[prompt...]", "Prompt to process")
  .option("-m, --model <model>", "Model to use")
  .option("-p, --provider <provider>", "Provider to use")
  .option("-f, --file <file>", "File to reference (@file syntax)")
  .action(async (promptParts, options) => {
    const prompt = promptParts.join(" ");
    await printMode(prompt, options);
  });

// JSON mode
program
  .command("json")
  .description("JSON mode for automation (machine-readable output)")
  .argument("[prompt...]", "Prompt to process")
  .option("-m, --model <model>", "Model to use")
  .option("-p, --provider <provider>", "Provider to use")
  .action(async (promptParts, options) => {
    const prompt = promptParts.join(" ");
    await jsonMode(prompt, options);
  });

// List tools
program
  .command("tools")
  .description("List available tools")
  .action(() => {
    const tools = getBuiltinTools();
    console.log("\nAvailable Tools:\n");
    tools.forEach((tool) => {
      console.log(`  ${tool.name.padEnd(20)} - ${tool.description}`);
    });
  });

// List models
program
  .command("models")
  .description("List available models")
  .action(() => {
    console.log("\nAvailable Providers & Models:\n");
    console.log("  OpenAI:");
    console.log("    - gpt-4");
    console.log("    - gpt-4-turbo");
    console.log("    - gpt-3.5-turbo");
    console.log("  Anthropic:");
    console.log("    - claude-3-opus");
    console.log("    - claude-3-sonnet");
    console.log("\nMore providers available via model router!\n");
  });

// Parse and execute
program.parse(process.argv);
