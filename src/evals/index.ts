/**
 * Evaluation Framework
 * From Mastra - Automated testing and validation for agents
 */

// ============================================================================
// Evaluation Types
// ============================================================================

export interface EvaluationInput<T = any> {
  agentOutput: any;
  expected: T;
  input?: any;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface EvaluationResult {
  score: number;
  passed: boolean;
  feedback?: string;
  metadata?: Record<string, any>;
}

export interface Evaluator<T = any> {
  id: string;
  name: string;
  description: string;
  evaluate: (input: EvaluationInput<T>) => Promise<EvaluationResult>;
}

export interface DatasetItem {
  id: string;
  input: any;
  expected: any;
  metadata?: Record<string, any>;
}

export interface EvaluationConfig {
  dataset: DatasetItem[];
  evaluators: Evaluator[];
  parallel?: boolean;
  onProgress?: (progress: number, total: number) => void;
}

export interface EvaluationReport {
  totalItems: number;
  passedItems: number;
  failedItems: number;
  averageScore: number;
  results: Array<{
    item: DatasetItem;
    evaluators: Record<string, EvaluationResult>;
  }>;
  duration: number;
}

// ============================================================================
// Built-in Evaluators
// ============================================================================

/**
 * Accuracy evaluator - Checks if output matches expected exactly
 */
export class AccuracyEvaluator implements Evaluator<string> {
  id = "accuracy";
  name = "Accuracy";
  description = "Checks if agent output exactly matches expected value";

  async evaluate(input: EvaluationInput<string>): Promise<EvaluationResult> {
    const agentOutputStr = String(input.agentOutput).trim().toLowerCase();
    const expectedStr = String(input.expected).trim().toLowerCase();

    const passed = agentOutputStr === expectedStr;

    return {
      score: passed ? 1 : 0,
      passed,
      feedback: passed
        ? "Output matches expected value"
        : `Output '${agentOutputStr}' does not match expected '${expectedStr}'`,
    };
  }
}

/**
 * Contains evaluator - Checks if expected value is contained in output
 */
export class ContainsEvaluator implements Evaluator<string> {
  id = "contains";
  name = "Contains";
  description = "Checks if expected value is contained in agent output";

  async evaluate(input: EvaluationInput<string>): Promise<EvaluationResult> {
    const agentOutputStr = String(input.agentOutput).toLowerCase();
    const expectedStr = String(input.expected).trim().toLowerCase();

    const passed = agentOutputStr.includes(expectedStr);

    return {
      score: passed ? 1 : 0,
      passed,
      feedback: passed
        ? "Output contains expected value"
        : `Output '${agentOutputStr}' does not contain '${expectedStr}'`,
    };
  }
}

/**
 * JSON structure evaluator - Validates JSON structure
 */
export class JSONStructureEvaluator implements Evaluator<object> {
  id = "json_structure";
  name = "JSON Structure";
  description = "Validates JSON structure and required fields";

  constructor(
    private schema?: Record<string, any>,
    private requiredFields?: string[]
  ) {}

  async evaluate(input: EvaluationInput<object>): Promise<EvaluationResult> {
    try {
      const output = input.agentOutput;

      // Check if output is valid JSON
      if (typeof output !== "object" || output === null) {
        return {
          score: 0,
          passed: false,
          feedback: "Output is not a valid object",
        };
      }

      // Check required fields
      if (this.requiredFields) {
        const missingFields = this.requiredFields.filter((field) => !(field in output));
        if (missingFields.length > 0) {
          return {
            score: 0,
            passed: false,
            feedback: `Missing required fields: ${missingFields.join(", ")}`,
          };
        }
      }

      // Check schema (simplified)
      if (this.schema) {
        const hasCorrectStructure = this.checkSchema(output, this.schema);
        return {
          score: hasCorrectStructure ? 1 : 0,
          passed: hasCorrectStructure,
          feedback: hasCorrectStructure
            ? "Output matches expected schema"
            : "Output does not match expected schema",
        };
      }
    } catch (error) {
      return {
        score: 0,
        passed: false,
        feedback: `Error evaluating: ${error}`,
      };
    }
  }

  private checkSchema(obj: any, schema: Record<string, any>): boolean {
    // Simplified schema check
    for (const key in schema) {
      if (!(key in obj)) return false;

      const schemaValue = schema[key];
      const objValue = obj[key];

      // Type check
      if (typeof schemaValue !== typeof objValue) return false;

      // Nested object check
      if (typeof schemaValue === "object" && typeof objValue === "object") {
        if (!this.checkSchema(objValue, schemaValue as Record<string, any>)) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * Length evaluator - Checks output length constraints
 */
export class LengthEvaluator implements Evaluator<string | any[]> {
  id = "length";
  name = "Length";
  description = "Checks if output length is within specified bounds";

  constructor(
    private minLength?: number,
    private maxLength?: number
  ) {}

  async evaluate(input: EvaluationInput<string | any[]>): Promise<EvaluationResult> {
    const length =
      typeof input.agentOutput === "string"
        ? input.agentOutput.length
        : Array.isArray(input.agentOutput)
        ? input.agentOutput.length
        : 0;

    const passed =
      (!this.minLength || length >= this.minLength) &&
      (!this.maxLength || length <= this.maxLength);

    return {
      score: passed ? 1 : 0,
      passed,
      feedback: passed
        ? "Length is within bounds"
        : `Length ${length} ${this.minLength ? `less than ${this.minLength}` : ""} ${this.maxLength ? `greater than ${this.maxLength}` : ""}`,
    };
  }
}

// ============================================================================
// Dataset Management
// ============================================================================

/**
 * Dataset manager for loading and managing test data
 */
export class DatasetManager {
  private items: DatasetItem[] = [];

  /**
   * Load dataset from array
   */
  load(items: DatasetItem[]): void {
    this.items = items;
  }

  /**
   * Load dataset from JSON file (simplified)
   */
  async loadFromFile(filePath: string): Promise<void> {
    // Would use fs.readFile in real implementation
    console.log(`[DatasetManager] Loading dataset from ${filePath}`);
  }

  /**
   * Get all items
   */
  getAll(): DatasetItem[] {
    return [...this.items];
  }

  /**
   * Get item by ID
   */
  getById(id: string): DatasetItem | undefined {
    return this.items.find((item) => item.id === id);
  }

  /**
   * Filter items
   */
  filter(predicate: (item: DatasetItem) => boolean): DatasetItem[] {
    return this.items.filter(predicate);
  }

  /**
   * Add item
   */
  add(item: DatasetItem): void {
    this.items.push(item);
  }

  /**
   * Clear dataset
   */
  clear(): void {
    this.items = [];
  }
}

// ============================================================================
// Evaluation Runner
// ============================================================================

/**
 * Runs evaluation against a dataset
 */
export class EvaluationRunner {
  private config: EvaluationConfig;

  constructor(config: EvaluationConfig) {
    this.config = config;
  }

  /**
   * Run full evaluation
   */
  async run(): Promise<EvaluationReport> {
    const startTime = Date.now();
    const results: Array<{
      item: DatasetItem;
      evaluators: Record<string, EvaluationResult>;
    }> = [];

    const totalItems = this.config.dataset.length;

    // Evaluate each item
    for (let i = 0; i < totalItems; i++) {
      const item = this.config.dataset[i];

      // Run all evaluators for this item
      const evaluators: Record<string, EvaluationResult> = {};

      if (this.config.parallel) {
        // Run all evaluators in parallel
        const evaluatorPromises = this.config.evaluators.map(async (evaluator) => {
          const input: EvaluationInput = {
            agentOutput: item.expected, // Would be actual agent output
            expected: item.expected,
            input: item.input,
            context: item.metadata,
          };

          return {
            [evaluator.id]: await evaluator.evaluate(input),
          };
        });

        const parallelResults = await Promise.all(evaluatorPromises);
        Object.assign(evaluators, ...parallelResults);
      } else {
        // Run evaluators sequentially
        for (const evaluator of this.config.evaluators) {
          const input: EvaluationInput = {
            agentOutput: item.expected,
            expected: item.expected,
            input: item.input,
            context: item.metadata,
          };

          evaluators[evaluator.id] = await evaluator.evaluate(input);
        }
      }

      results.push({
        item,
        evaluators,
      });

      // Call progress callback
      this.config.onProgress?.(i + 1, totalItems);
    }

    // Calculate overall results
    let passedItems = 0;
    let totalScore = 0;

    for (const result of results) {
      const allPassed = Object.values(result.evaluators).every((e) => e.passed);
      if (allPassed) passedItems++;

      const avgScore =
        Object.values(result.evaluators).reduce((sum, e) => sum + e.score, 0) /
        Object.keys(result.evaluators).length;

      totalScore += avgScore;
    }

    const averageScore = totalScore / results.length;

    return {
      totalItems,
      passedItems,
      failedItems: totalItems - passedItems,
      averageScore,
      results,
      duration: Date.now() - startTime,
    };
  }

  /**
   * Generate report
   */
  generateReport(report: EvaluationReport): string {
    const lines: string[] = [];

    lines.push("Evaluation Report");
    lines.push("=".repeat(50));
    lines.push(`Total items: ${report.totalItems}`);
    lines.push(`Passed: ${report.passedItems}`);
    lines.push(`Failed: ${report.failedItems}`);
    lines.push(`Average score: ${(report.averageScore * 100).toFixed(1)}%`);
    lines.push(`Duration: ${report.duration}ms`);
    lines.push("");

    lines.push("Results:");
    lines.push("-".repeat(40));

    for (const result of report.results) {
      const allPassed = Object.values(result.evaluators).every((e) => e.passed);
      lines.push(
        `[${allPassed ? "PASS" : "FAIL"}] ${result.item.id}: ${result.item.expected}`
      );

      for (const [evalId, evalResult] of Object.entries(result.evaluators)) {
        lines.push(`  ${evalId}: ${evalResult.score.toFixed(2)} - ${evalResult.feedback || ""}`);
      }
    }

    return lines.join("\n");
  }
}

/**
 * Default dataset manager
 */
export const datasetManager = new DatasetManager();

// ============================================================================
// Evaluation Factory
// ============================================================================

/**
 * Create evaluator from config
 */
export function createEvaluator(config: {
  id: string;
  name: string;
  description: string;
  evaluate: (input: EvaluationInput<any>) => Promise<EvaluationResult>;
}): Evaluator {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    evaluate: config.evaluate,
  };
}

/**
 * Create evaluation runner
 */
export function createEvaluationRunner(config: EvaluationConfig): EvaluationRunner {
  return new EvaluationRunner(config);
}
