/**
 * Unit Tests - EventBus
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventBus } from "../../events/index.js";
import type { AgentEvent } from "../../types/index.js";

describe("EventBus", () => {
  let eventBus: EventBus;
  let testEvent: AgentEvent;

  beforeEach(() => {
    eventBus = new EventBus();
    testEvent = {
      type: "test_event",
      timestamp: Date.now(),
    } as AgentEvent;
  });

  afterEach(() => {
    eventBus.clear();
  });

  it("should subscribe to events", () => {
    const mockListener = vi.fn();
    const unsubscribe = eventBus.subscribe("test_event", mockListener);

    expect(typeof unsubscribe).toBe("function");
  });

  it("should call subscribed listeners when event is emitted", () => {
    const mockListener = vi.fn();
    eventBus.subscribe("test_event", mockListener);

    eventBus.emit(testEvent);

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith(testEvent);
  });

  it("should call multiple subscribed listeners", () => {
    const mockListener1 = vi.fn();
    const mockListener2 = vi.fn();

    eventBus.subscribe("test_event", mockListener1);
    eventBus.subscribe("test_event", mockListener2);

    eventBus.emit(testEvent);

    expect(mockListener1).toHaveBeenCalledTimes(1);
    expect(mockListener2).toHaveBeenCalledTimes(1);
  });

  it("should unsubscribe listener", () => {
    const mockListener = vi.fn();
    const unsubscribe = eventBus.subscribe("test_event", mockListener);

    unsubscribe();

    eventBus.emit(testEvent);

    expect(mockListener).not.toHaveBeenCalled();
  });

  it("should get event types", () => {
    const eventTypes = eventBus.getEventTypes();

    expect(Array.isArray(eventTypes)).toBe(true);
    expect(eventTypes.length).toBeGreaterThan(0);
  });

  it("should get listener count", () => {
    const mockListener1 = vi.fn();
    const mockListener2 = vi.fn();

    eventBus.subscribe("test_event", mockListener1);
    eventBus.subscribe("test_event", mockListener2);

    const count = eventBus.getListenerCount("test_event");

    expect(count).toBe(2);
  });

  it("should clear all listeners", () => {
    const mockListener = vi.fn();
    eventBus.subscribe("test_event", mockListener);

    eventBus.clear();

    expect(eventBus.getListenerCount("test_event")).toBe(0);
  });

  it("should handle errors in listeners gracefully", () => {
    const erroringListener = () => {
      throw new Error("Test error");
    };
    const mockLogger = vi.fn();

    // Spy on console.error
    const originalError = console.error;
    console.error = mockLogger;

    try {
      eventBus.subscribe("test_event", erroringListener);
      eventBus.emit(testEvent);
    } finally {
      console.error = originalError;
    }

    expect(mockLogger).toHaveBeenCalled();
  });
});
