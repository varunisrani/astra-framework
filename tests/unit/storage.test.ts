/**
 * Unit Tests - Storage
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryStorage, FileStorage, createStorage } from "../../storage/index.js";
import type { AgentState } from "../../types/index.js";
import * as fs from "fs/promises";
import * as os from "os";

describe("Storage", () => {
  describe("InMemoryStorage", () => {
    it("should save and load state", async () => {
      const storage = new InMemoryStorage();
      const state: AgentState = {
        id: "test",
        systemPrompt: "Test",
        model: "gpt-4",
        provider: "openai",
        thinkingLevel: "off",
        tools: [],
        messages: [],
        isStreaming: false,
        streamMessage: null,
        pendingToolCalls: new Set(),
      };

      await storage.saveState("test", state);
      const loaded = await storage.loadState("test");

      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe("test");
      expect(loaded?.systemPrompt).toBe("Test");
    });

    it("should return null for non-existent state", async () => {
      const storage = new InMemoryStorage();
      const loaded = await storage.loadState("nonexistent");

      expect(loaded).toBeNull();
    });

    it("should delete state", async () => {
      const storage = new InMemoryStorage();
      const state: AgentState = {
        id: "test",
        systemPrompt: "Test",
        model: "gpt-4",
        provider: "openai",
        thinkingLevel: "off",
        tools: [],
        messages: [],
        isStreaming: false,
        streamMessage: null,
        pendingToolCalls: new Set(),
      };

      await storage.saveState("test", state);
      await storage.deleteState("test");

      const loaded = await storage.loadState("test");

      expect(loaded).toBeNull();
    });

    it("should list all states", async () => {
      const storage = new InMemoryStorage();

      await storage.saveState("test1", {} as AgentState);
      await storage.saveState("test2", {} as AgentState);

      const ids = await storage.listStates();

      expect(ids).toHaveLength(2);
      expect(ids).toContain("test1");
      expect(ids).toContain("test2");
    });

    it("should be ready", async () => {
      const storage = new InMemoryStorage();
      const ready = await storage.isReady();

      expect(ready).toBe(true);
    });
  });

  describe("FileStorage", () => {
    const testDir = os.tmpdir() + "/astra-test-" + Date.now();

    beforeEach(async () => {
      await fs.mkdir(testDir, { recursive: true });
    });

    it("should save and load state", async () => {
      const storage = new FileStorage({ basePath: testDir });
      const state: AgentState = {
        id: "test",
        systemPrompt: "Test",
        model: "gpt-4",
        provider: "openai",
        thinkingLevel: "off",
        tools: [],
        messages: [],
        isStreaming: false,
        streamMessage: null,
        pendingToolCalls: new Set(),
      };

      await storage.saveState("test", state);
      const loaded = await storage.loadState("test");

      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe("test");
      expect(loaded?.systemPrompt).toBe("Test");
    });

    it("should return null for non-existent file", async () => {
      const storage = new FileStorage({ basePath: testDir });
      const loaded = await storage.loadState("nonexistent");

      expect(loaded).toBeNull();
    });

    it("should delete state file", async () => {
      const storage = new FileStorage({ basePath: testDir });
      const state: AgentState = {
        id: "test",
        systemPrompt: "Test",
        model: "gpt-4",
        provider: "openai",
        thinkingLevel: "off",
        tools: [],
        messages: [],
        isStreaming: false,
        streamMessage: null,
        pendingToolCalls: new Set(),
      };

      await storage.saveState("test", state);
      await storage.deleteState("test");

      const loaded = await storage.loadState("test");

      expect(loaded).toBeNull();
    });
  });

  describe("createStorage", () => {
    it("should create in-memory storage", () => {
      const storage = createStorage({ type: "memory" });

      expect(storage).toBeInstanceOf(InMemoryStorage);
    });

    it("should create file storage", () => {
      const storage = createStorage({ type: "file", basePath: "/tmp/test" });

      expect(storage).toBeInstanceOf(FileStorage);
    });

    it("should throw for unknown storage type", () => {
      expect(() => {
        createStorage({ type: "unknown" as any });
      }).toThrow();
    });
  });
});
