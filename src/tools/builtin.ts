/**
 * Built-in Tools
 * From Indusagi - Simple but functional tool system
 */

import type { AgentTool } from "../types/index.js";
import * as fs from "fs/promises";
import * as path from "path";

// ============================================================================
// File System Tools
// ============================================================================

/**
 * Read file tool
 */
export const readFileTool: AgentTool<{ path: string }> = {
  name: "read_file",
  description: "Read the contents of a file",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "Path to the file to read" },
    },
    required: ["path"],
  },
  handler: async ({ path: filePath }) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  },
};

/**
 * Write file tool
 */
export const writeFileTool: AgentTool<{ path: string; content: string }> = {
  name: "write_file",
  description: "Write content to a file (creates or overwrites)",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "Path to the file to write" },
      content: { type: "string", description: "Content to write to the file" },
    },
    required: ["path", "content"],
  },
  handler: async ({ path: filePath, content }) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(filePath, content, "utf-8");
      return `Successfully wrote to ${filePath}`;
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  },
};

/**
 * List directory tool
 */
export const listFilesTool: AgentTool<{ path?: string }> = {
  name: "list_files",
  description: "List files and directories in a given path",
  parameters: {
    type: "object",
    properties: {
      path: {
        type: "string",
        description: "Path to the directory (default: current directory)",
      },
    },
  },
  handler: async ({ path: filePath = "." }) => {
    try {
      const entries = await fs.readdir(filePath, { withFileTypes: true });
      const items = entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file",
      }));

      return JSON.stringify(items, null, 2);
    } catch (error) {
      throw new Error(`Failed to list directory: ${error}`);
    }
  },
};

// ============================================================================
// Web Tools
// ============================================================================

/**
 * Web search tool
 */
export const webSearchTool: AgentTool<{ query: string; count?: number }> = {
  name: "web_search",
  description: "Search the web for information",
  parameters: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search query" },
      count: {
        type: "number",
        description: "Number of results (default: 5)",
      },
    },
    required: ["query"],
  },
  handler: async ({ query, count = 5 }) => {
    // TODO: Implement actual web search (Brave API, etc.)
    console.log(`[WebSearch] Searching for: ${query}`);

    // Simulated results
    return JSON.stringify(
      {
        query,
        results: Array.from({ length: count }, (_, i) => ({
          title: `Result ${i + 1} for "${query}"`,
          url: `https://example.com/result${i + 1}`,
          snippet: `Snippet for result ${i + 1}`,
        })),
      },
      null,
      2
    );
  },
};

/**
 * Web fetch tool
 */
export const webFetchTool: AgentTool<{ url: string }> = {
  name: "web_fetch",
  description: "Fetch and extract content from a URL",
  parameters: {
    type: "object",
    properties: {
      url: { type: "string", description: "URL to fetch" },
    },
    required: ["url"],
  },
  handler: async ({ url }) => {
    // TODO: Implement actual web fetch
    console.log(`[WebFetch] Fetching: ${url}`);

    // Simulated response
    return `Content from ${url}`;
  },
};

// ============================================================================
// Utility Tools
// ============================================================================

/**
 * Calculator tool
 */
export const calculatorTool: AgentTool<{
  expression: string;
}> = {
  name: "calculator",
  description: "Perform mathematical calculations",
  parameters: {
    type: "object",
    properties: {
      expression: {
        type: "string",
        description: "Mathematical expression (e.g., '2 + 2', '10 * 5')",
      },
    },
    required: ["expression"],
  },
  handler: async ({ expression }) => {
    try {
      // Safe evaluation (basic math only)
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      return { expression, result };
    } catch (error) {
      throw new Error(`Failed to calculate: ${error}`);
    }
  },
};

/**
 * Date/Time tool
 */
export const dateTimeTool: AgentTool<{}> = {
  name: "date_time",
  description: "Get current date and time",
  parameters: {
    type: "object",
    properties: {},
  },
  handler: async () => {
    const now = new Date();
    return {
      iso: now.toISOString(),
      utc: now.toUTCString(),
      local: now.toLocaleString(),
      timestamp: now.getTime(),
    };
  },
};

/**
 * Sleep tool
 */
export const sleepTool: AgentTool<{ seconds: number }> = {
  name: "sleep",
  description: "Pause execution for a specified number of seconds",
  parameters: {
    type: "object",
    properties: {
      seconds: {
        type: "number",
        description: "Number of seconds to sleep",
        minimum: 0,
      },
    },
    required: ["seconds"],
  },
  handler: async ({ seconds }) => {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    return `Slept for ${seconds} seconds`;
  },
};

// ============================================================================
// Tool Registry
// ============================================================================

/**
 * Get all built-in tools
 */
export function getBuiltinTools(): AgentTool<any>[] {
  return [
    readFileTool,
    writeFileTool,
    listFilesTool,
    webSearchTool,
    webFetchTool,
    calculatorTool,
    dateTimeTool,
    sleepTool,
  ];
}

/**
 * Get tool by name
 */
export function getToolByName(name: string): AgentTool<any> | undefined {
  return getBuiltinTools().find((t) => t.name === name);
}
