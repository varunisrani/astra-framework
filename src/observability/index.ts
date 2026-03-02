/**
 * Observability
 * From Mastra - OpenTelemetry integration for production monitoring
 */

// ============================================================================
// Logger
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

/**
 * Simple structured logger
 */
export class Logger {
  private level: LogLevel;
  private prefix: string;

  constructor(config: { level?: LogLevel; prefix?: string } = {}) {
    this.level = config.level || "info";
    this.prefix = config.prefix || "[Astra]";
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog("debug")) {
      this.log("debug", message, meta);
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog("info")) {
      this.log("info", message, meta);
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog("warn")) {
      this.log("warn", message, meta);
    }
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, any>): void {
    if (this.shouldLog("error")) {
      this.log("error", message, {
        ...meta,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      });
    }
  }

  private log(level: LogLevel, message: string, meta?: Record<string, any>): void {
    const timestamp = new Date().toISOString();
    const logEntry: any = {
      timestamp,
      level,
      message,
    };

    if (meta && Object.keys(meta).length > 0) {
      logEntry.meta = meta;
    }

    const prefix = this.prefix ? `${this.prefix} ` : "";
    const levelStr = level.toUpperCase().padEnd(5);
    console.log(`${prefix}${levelStr} ${message}`, meta || "");
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger({ level: "info" });

// ============================================================================
// Span/Tracing (Simplified)
// ============================================================================

export interface Span {
  name: string;
  startTime: number;
  endTime?: number;
  attributes?: Record<string, any>;
  events?: Array<{ name: string; timestamp: number; attributes?: Record<string, any> }>;
  status?: { code: number; message: string };
}

/**
 * Simple span implementation (no OpenTelemetry dependency for now)
 * TODO: Add full OpenTelemetry integration
 */
export class SimpleSpan implements Span {
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, any> = {};
  events: Array<{ name: string; timestamp: number; attributes?: Record<string, any> }> = [];
  status?: { code: number; message: string };

  constructor(name: string) {
    this.name = name;
    this.startTime = Date.now();
  }

  /**
   * Add attribute to span
   */
  setAttribute(key: string, value: any): void {
    this.attributes[key] = value;
  }

  /**
   * Add event to span
   */
  addEvent(name: string, attributes?: Record<string, any>): void {
    this.events.push({
      name,
      timestamp: Date.now(),
      attributes,
    });
  }

  /**
   * Set span status
   */
  setStatus(code: number, message: string): void {
    this.status = { code, message };
  }

  /**
   * End the span
   */
  end(): void {
    this.endTime = Date.now();
  }

  /**
   * Get duration in milliseconds
   */
  getDuration(): number {
    if (!this.endTime) return 0;
    return this.endTime - this.startTime;
  }
}

// ============================================================================
// Observability Manager
// ============================================================================

/**
 * Observability manager for tracking agent execution
 */
export class ObservabilityManager {
  private spans = new Map<string, Span>();
  private currentSpan: Span | null = null;

  /**
   * Start a new span
   */
  startSpan(name: string, parent?: Span): Span {
    const span = new SimpleSpan(name);
    this.spans.set(name, span);
    this.currentSpan = span;

    logger.debug(`Started span: ${name}`);
    return span;
  }

  /**
   * Get current span
   */
  getCurrentSpan(): Span | null {
    return this.currentSpan;
  }

  /**
   * End a span
   */
  endSpan(name: string): void {
    const span = this.spans.get(name);
    if (span) {
      span.end();
      this.spans.delete(name);
      if (this.currentSpan === span) {
        this.currentSpan = null;
      }

      logger.debug(
        `Ended span: ${name} (${span.getDuration()}ms)`,
        span.attributes
      );
    }
  }

  /**
   * Get all spans
   */
  getSpans(): Span[] {
    return Array.from(this.spans.values());
  }

  /**
   * Clear all spans
   */
  clear(): void {
    this.spans.clear();
    this.currentSpan = null;
  }
}

/**
 * Default observability manager
 */
export const observability = new ObservabilityManager();

// ============================================================================
// Metrics Collection (Simplified)
// ============================================================================

export interface Metrics {
  agentStarts: number;
  agentErrors: number;
  toolCalls: number;
  toolErrors: number;
  totalTokens: number;
  totalCost: number;
}

/**
 * Simple metrics collector
 */
export class MetricsCollector {
  private metrics: Metrics = {
    agentStarts: 0,
    agentErrors: 0,
    toolCalls: 0,
    toolErrors: 0,
    totalTokens: 0,
    totalCost: 0,
  };

  incrementAgentStart(): void {
    this.metrics.agentStarts++;
  }

  incrementAgentError(): void {
    this.metrics.agentErrors++;
  }

  incrementToolCall(): void {
    this.metrics.toolCalls++;
  }

  incrementToolError(): void {
    this.metrics.toolErrors++;
  }

  addTokens(count: number): void {
    this.metrics.totalTokens += count;
  }

  addCost(cost: number): void {
    this.metrics.totalCost += cost;
  }

  getMetrics(): Metrics {
    return { ...this.metrics };
  }

  reset(): void {
    this.metrics = {
      agentStarts: 0,
      agentErrors: 0,
      toolCalls: 0,
      toolErrors: 0,
      totalTokens: 0,
      totalCost: 0,
    };
  }

  /**
   * Get metrics as formatted string
   */
  getFormatted(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

/**
 * Default metrics collector
 */
export const metrics = new MetricsCollector();
