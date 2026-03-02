/**
 * Workflow System
 * From Mastra - Graph-based orchestration for complex multi-step processes
 */

import type { AgentTool } from "../types/index.js";

// ============================================================================
// Workflow Types
// ============================================================================

export interface WorkflowStep<TInput = any, TOutput = any> {
  id: string;
  name: string;
  execute: (input: TInput, context: WorkflowContext) => Promise<TOutput>;
  timeout?: number;
  retries?: number;
}

export interface WorkflowContext {
  state: Record<string, any>;
  signal?: AbortSignal;
  metadata?: Record<string, any>;
}

export interface WorkflowConfig<TInput = any, TOutput = any> {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep<TInput, any>[];
  initial?: TInput;
  onError?: (error: Error, context: WorkflowContext) => void;
  onComplete?: (result: TOutput, context: WorkflowContext) => void;
}

export type StepOutput<T> = {
  stepId: string;
  output: T;
  duration: number;
  error?: Error;
};

export type WorkflowResult<T = any> = {
  success: boolean;
  result?: T;
  error?: Error;
  steps: StepOutput<any>[];
  duration: number;
};

// ============================================================================
// Workflow Class
// ============================================================================

/**
 * Workflow orchestration engine
 * Supports sequential, parallel, and branching execution
 */
export class Workflow<TInput = any, TOutput = any> {
  private config: WorkflowConfig<TInput, TOutput>;
  private steps = new Map<string, WorkflowStep<any, any>>();
  private transitions: WorkflowTransition[] = [];

  constructor(config: WorkflowConfig<TInput, TOutput>) {
    this.config = config;

    // Index steps
    for (const step of config.steps) {
      this.steps.set(step.id, step);
    }
  }

  /**
   * Add a sequential transition (step1 → step2)
   */
  then(fromStepId: string, toStepId: string): this {
    this.transitions.push({ type: "sequential", from: fromStepId, to: toStepId });
    return this;
  }

  /**
   * Add parallel transitions (step → [step1, step2, ...])
   */
  parallel(fromStepId: string, toStepIds: string[]): this {
    for (const toId of toStepIds) {
      this.transitions.push({
        type: "parallel",
        from: fromStepId,
        to: toId,
      });
    }
    return this;
  }

  /**
   * Add conditional branching (step → step1 if condition, step2 otherwise)
   */
  branch(
    fromStepId: string,
    condition: (context: WorkflowContext) => boolean | Promise<boolean>,
    trueStepId: string,
    falseStepId: string
  ): this {
    this.transitions.push({
      type: "branch",
      from: fromStepId,
      condition,
      trueStep: trueStepId,
      falseStep: falseStepId,
    });
    return this;
  }

  /**
   * Execute workflow with initial input
   */
  async execute(initial?: TInput): Promise<WorkflowResult<TOutput>> {
    const startTime = Date.now();
    const context: WorkflowContext = {
      state: this.config.initial !== undefined ? { ...this.config.initial, ...initial } : {},
      metadata: {},
    };

    const results: StepOutput<any>[] = [];

    try {
      // Find start steps (no incoming transitions)
      const startSteps = this.getStartSteps();
      if (startSteps.length === 0) {
        throw new Error("No start steps found in workflow");
      }

      // Execute from each start step
      for (const startStep of startSteps) {
        const stepResult = await this.executeStep(startStep.id, context);
        results.push(stepResult);

        // Update state with output
        context.state[startStep.id] = stepResult.output;

        // Find and execute next steps
        await this.executeNextSteps(startStep.id, context, results);
      }

      // Call completion callback
      const finalOutput = this.getFinalOutput(context);
      this.config.onComplete?.(finalOutput, context);

      return {
        success: true,
        result: finalOutput,
        steps: results,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      // Call error callback
      this.config.onError?.(error as Error, context);

      return {
        success: false,
        error: error as Error,
        steps: results,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get start steps (no incoming transitions)
   */
  private getStartSteps(): WorkflowStep<any, any>[] {
    const hasIncoming = new Set<string>();

    for (const trans of this.transitions) {
      if (Array.isArray(trans.to)) {
        for (const toId of trans.to) {
          hasIncoming.add(toId);
        }
      } else if (trans.type === "branch") {
        hasIncoming.add(trans.trueStep);
        hasIncoming.add(trans.falseStep);
      } else {
        hasIncoming.add(trans.to);
      }
    }

    return Array.from(this.steps.values()).filter((step) => !hasIncoming.has(step.id));
  }

  /**
   * Execute a single step with retries
   */
  private async executeStep(
    stepId: string,
    context: WorkflowContext
  ): Promise<StepOutput<any>> {
    const step = this.steps.get(stepId);
    if (!step) {
      throw new Error(`Step not found: ${stepId}`);
    }

    const maxRetries = step.retries || 3;
    const timeout = step.timeout || 30000; // 30 seconds default

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(step, context, timeout);
        return {
          stepId,
          output: result,
          duration: 0,
        };
      } catch (error) {
        lastError = error as Error;

        // If not the last attempt, retry
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }

    throw lastError || new Error("Step execution failed");
  }

  /**
   * Execute step with timeout
   */
  private async executeWithTimeout(
    step: WorkflowStep<any, any>,
    context: WorkflowContext,
    timeout: number
  ): Promise<any> {
    return Promise.race([
      step.execute(context.state, context),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Step timeout")), timeout)
      ),
    ]);
  }

  /**
   * Execute next steps based on transitions
   */
  private async executeNextSteps(
    fromStepId: string,
    context: WorkflowContext,
    results: StepOutput<any>[]
  ): Promise<void> {
    const transitions = this.transitions.filter((t) => t.from === fromStepId);

    for (const trans of transitions) {
      if (trans.type === "parallel") {
        // Execute all next steps in parallel
        const parallelResults = await Promise.all(
          trans.to.map((toId) => this.executeStep(toId, context))
        );

        for (const result of parallelResults) {
          results.push(result);
          context.state[result.stepId] = result.output;
        }
      } else if (trans.type === "branch") {
        // Evaluate condition
        const shouldTakeTrue = await Promise.resolve(
          trans.condition!(context)
        );
        const nextStepId = shouldTakeTrue ? trans.trueStep : trans.falseStep;

        const result = await this.executeStep(nextStepId, context);
        results.push(result);
        context.state[nextStepId] = result.output;

        // Continue from that step
        await this.executeNextSteps(nextStepId, context, results);
        return;
      } else {
        // Sequential
        const result = await this.executeStep(trans.to, context);
        results.push(result);
        context.state[trans.to] = result.output;

        // Continue from that step
        await this.executeNextSteps(trans.to, context, results);
      }
    }
  }

  /**
   * Get final output from workflow
   */
  private getFinalOutput(context: WorkflowContext): TOutput {
    // For now, just return the last step output
    // In a real implementation, this would be configurable
    const entries = Object.entries(context.state);
    if (entries.length === 0) {
      return undefined as TOutput;
    }

    const [lastKey, lastValue] = entries[entries.length - 1];
    return lastValue as TOutput;
  }
}

// ============================================================================
// Workflow Types (Internal)
// ============================================================================

type WorkflowTransition =
  | { type: "sequential"; from: string; to: string }
  | { type: "parallel"; from: string; to: string[] }
  | {
      type: "branch";
      from: string;
      condition: (context: WorkflowContext) => boolean | Promise<boolean>;
      trueStep: string;
      falseStep: string;
    };

// ============================================================================
// Workflow Factory
// ============================================================================

/**
 * Create a new workflow
 */
export function createWorkflow<TInput = any, TOutput = any>(
  config: WorkflowConfig<TInput, TOutput>
): Workflow<TInput, TOutput> {
  return new Workflow(config);
}

/**
 * Create a simple step
 */
export function createStep<TInput = any, TOutput = any>(
  id: string,
  name: string,
  execute: (input: TInput, context: WorkflowContext) => Promise<TOutput>
): WorkflowStep<TInput, TOutput> {
  return { id, name, execute };
}

/**
 * Create a tool step (agent integration)
 */
export function createToolStep<TInput = any, TOutput = any>(
  id: string,
  name: string,
  tool: AgentTool<TInput>
): WorkflowStep<TInput, TOutput> {
  return {
    id,
    name,
    execute: async (input: TInput, context: WorkflowContext) => {
      const result = await tool.handler(input, context);
      return result as TOutput;
    },
  };
}
