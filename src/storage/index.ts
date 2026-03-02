/**
 * Storage Abstraction
 * From Mastra - Pluggable backends for state persistence
 */

import type { AgentState, Message } from "../types/index.js";

// ============================================================================
// Storage Interface
// ============================================================================

/**
 * Base storage interface
 * All storage backends must implement this
 */
export interface StorageBackend {
  /**
   * Save agent state
   */
  saveState(agentId: string, state: AgentState): Promise<void>;

  /**
   * Load agent state
   */
  loadState(agentId: string): Promise<AgentState | null>;

  /**
   * Delete agent state
   */
  deleteState(agentId: string): Promise<void>;

  /**
   * List all agent IDs
   */
  listStates(): Promise<string[]>;

  /**
   * Check if storage is ready
   */
  isReady(): Promise<boolean>;
}

// ============================================================================
// In-Memory Storage (Default)
// ============================================================================

/**
 * In-memory storage for development
 * No persistence, suitable for testing and development
 */
export class InMemoryStorage implements StorageBackend {
  private store = new Map<string, AgentState>();

  async saveState(agentId: string, state: AgentState): Promise<void> {
    this.store.set(agentId, this.cloneState(state));
  }

  async loadState(agentId: string): Promise<AgentState | null> {
    const state = this.store.get(agentId);
    return state ? this.cloneState(state) : null;
  }

  async deleteState(agentId: string): Promise<void> {
    this.store.delete(agentId);
  }

  async listStates(): Promise<string[]> {
    return Array.from(this.store.keys());
  }

  async isReady(): Promise<boolean> {
    return true;
  }

  /**
   * Deep clone state (handles Sets)
   */
  private cloneState(state: AgentState): AgentState {
    return {
      ...state,
      messages: [...state.messages],
      tools: [...state.tools],
      pendingToolCalls: new Set(state.pendingToolCalls),
      streamMessage: state.streamMessage ? { ...state.streamMessage } : null,
      metadata: state.metadata ? { ...state.metadata } : undefined,
    };
  }
}

// ============================================================================
// File-Based Storage
// ============================================================================

import * as fs from "fs/promises";
import * as path from "path";

/**
 * File-based storage with JSON persistence
 * Suitable for simple persistence without database
 */
export class FileStorage implements StorageBackend {
  private basePath: string;

  constructor(config: { basePath?: string } = {}) {
    this.basePath = config.basePath || path.join(process.cwd(), ".astra", "storage");
  }

  private getFilePath(agentId: string): string {
    return path.join(this.basePath, `${agentId}.json`);
  }

  async saveState(agentId: string, state: AgentState): Promise<void> {
    // Ensure directory exists
    await fs.mkdir(this.basePath, { recursive: true });

    // Write state to file
    const filePath = this.getFilePath(agentId);
    await fs.writeFile(filePath, JSON.stringify(state, null, 2), "utf-8");
  }

  async loadState(agentId: string): Promise<AgentState | null> {
    try {
      const filePath = this.getFilePath(agentId);
      const content = await fs.readFile(filePath, "utf-8");
      const state = JSON.parse(content);

      // Reconstruct Sets from arrays
      return {
        ...state,
        pendingToolCalls: new Set(state.pendingToolCalls || []),
      };
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return null; // File doesn't exist
      }
      throw error;
    }
  }

  async deleteState(agentId: string): Promise<void> {
    try {
      const filePath = this.getFilePath(agentId);
      await fs.unlink(filePath);
    } catch (error) {
      if ((error as any).code !== "ENOENT") {
        throw error; // Ignore if file doesn't exist
      }
    }
  }

  async listStates(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.basePath);
      return files
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(".json", ""));
    } catch (error) {
      if ((error as any).code === "ENOENT") {
        return []; // Directory doesn't exist
      }
      throw error;
    }
  }

  async isReady(): Promise<boolean> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      return true;
    } catch {
      return false;
    }
  }
}

// ============================================================================
// PostgreSQL Storage (Production)
// ============================================================================

/**
 * PostgreSQL storage for production use
 * Requires pg package: npm install pg
 */
export class PostgresStorage implements StorageBackend {
  private connectionString: string;
  private pool: any = null; // Will be typed properly when pg is added

  constructor(config: { connectionString: string }) {
    this.connectionString = config.connectionString;
  }

  async saveState(agentId: string, state: AgentState): Promise<void> {
    // TODO: Implement PostgreSQL storage
    // This requires pg package dependency
    console.warn("[PostgresStorage] Not implemented yet. Using in-memory fallback.");

    // Fallback to in-memory for now
    throw new Error("PostgreSQL storage not yet implemented. Use FileStorage or InMemoryStorage.");
  }

  async loadState(agentId: string): Promise<AgentState | null> {
    throw new Error("PostgreSQL storage not yet implemented.");
  }

  async deleteState(agentId: string): Promise<void> {
    throw new Error("PostgreSQL storage not yet implemented.");
  }

  async listStates(): Promise<string[]> {
    throw new Error("PostgreSQL storage not yet implemented.");
  }

  async isReady(): Promise<boolean> {
    return false;
  }

  /**
   * Close connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

// ============================================================================
// Storage Factory
// ============================================================================

export type StorageConfig =
  | { type: "memory" }
  | { type: "file"; basePath?: string }
  | { type: "postgres"; connectionString: string };

/**
 * Create storage backend from configuration
 */
export function createStorage(config: StorageConfig): StorageBackend {
  switch (config.type) {
    case "memory":
      return new InMemoryStorage();

    case "file":
      return new FileStorage(
        "basePath" in config ? { basePath: config.basePath } : {}
      );

    case "postgres":
      return new PostgresStorage({
        connectionString: config.connectionString,
      });

    default:
      throw new Error(`Unknown storage type: ${(config as any).type}`);
  }
}

/**
 * Default in-memory storage (always available)
 */
export const defaultStorage = new InMemoryStorage();
