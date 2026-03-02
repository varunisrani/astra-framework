/**
 * Model Router
 * From Mastra - Best-in-class provider abstraction with 40+ providers
 */

import type {
  ModelConfig,
  ModelRequirements,
  ModelCapabilities,
  Message,
  AgentContext,
  StreamOptions,
} from "../types/index.js";

/**
 * Provider adapter interface
 * Each provider implements this interface
 */
export interface ProviderAdapter {
  name: string;
  supportedModels: ModelConfig[];

  generate(
    model: ModelConfig,
    context: AgentContext,
    options?: StreamOptions
  ): Promise<any>;

  stream?(
    model: ModelConfig,
    context: AgentContext,
    options?: StreamOptions
  ): AsyncIterable<any>;

  validateModel(model: string): boolean;
}

/**
 * Routing strategy interface
 */
export interface RoutingStrategy {
  select(
    providers: Map<string, ProviderAdapter>,
    requirements: ModelRequirements
  ): ModelConfig;
}

/**
 * Default cost-based routing strategy
 */
export class CostRoutingStrategy implements RoutingStrategy {
  select(
    providers: Map<string, ProviderAdapter>,
    requirements: ModelRequirements
  ): ModelConfig {
    const candidates: ModelConfig[] = [];

    for (const provider of providers.values()) {
      for (const model of provider.supportedModels) {
        // Check if model meets requirements
        if (this.meetsRequirements(model, requirements)) {
          candidates.push(model);
        }
      }
    }

    if (candidates.length === 0) {
      throw new Error("No model found that meets requirements");
    }

    // Sort by cost (cheapest first)
    candidates.sort((a, b) => {
      const costA = (a.pricing?.input || 0) + (a.pricing?.output || 0);
      const costB = (b.pricing?.input || 0) + (b.pricing?.output || 0);
      return costA - costB;
    });

    return candidates[0];
  }

  private meetsRequirements(
    model: ModelConfig,
    requirements: ModelRequirements
  ): boolean {
    // Check provider filter
    if (requirements.provider && model.provider !== requirements.provider) {
      return false;
    }

    // Check capabilities
    if (requirements.capabilities) {
      for (const cap of requirements.capabilities) {
        if (!model.capabilities[cap]) {
          return false;
        }
      }
    }

    // Check max cost
    if (requirements.maxCost) {
      const cost = (model.pricing?.input || 0) + (model.pricing?.output || 0);
      if (cost > requirements.maxCost) {
        return false;
      }
    }

    // Check max tokens
    if (requirements.maxTokens && model.capabilities.maxTokens) {
      if (model.capabilities.maxTokens < requirements.maxTokens) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Model Router - Central routing for all providers
 * Based on Mastra's model router
 */
export class ModelRouter {
  private providers = new Map<string, ProviderAdapter>();
  private routingStrategy: RoutingStrategy;

  constructor(routingStrategy?: RoutingStrategy) {
    this.routingStrategy = routingStrategy || new CostRoutingStrategy();
  }

  /**
   * Register a provider adapter
   */
  registerProvider(adapter: ProviderAdapter): void {
    this.providers.set(adapter.name, adapter);
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(name: string): void {
    this.providers.delete(name);
  }

  /**
   * Get a provider by name
   */
  getProvider(name: string): ProviderAdapter | undefined {
    return this.providers.get(name);
  }

  /**
   * Get all providers
   */
  getAllProviders(): ProviderAdapter[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all available models
   */
  getAllModels(): ModelConfig[] {
    const models: ModelConfig[] = [];
    for (const provider of this.providers.values()) {
      models.push(...provider.supportedModels);
    }
    return models;
  }

  /**
   * Get model by ID and provider
   */
  getModel(modelId: string, provider?: string): ModelConfig | undefined {
    for (const p of this.providers.values()) {
      if (provider && p.name !== provider) continue;

      const model = p.supportedModels.find((m) => m.id === modelId);
      if (model) return model;
    }
    return undefined;
  }

  /**
   * Select best model based on requirements
   */
  selectModel(requirements: ModelRequirements): ModelConfig {
    return this.routingStrategy.select(this.providers, requirements);
  }

  /**
   * Get model for context (using default routing)
   */
  getModel(context: AgentContext): ModelConfig {
    const requirements: ModelRequirements = {};
    return this.selectModel(requirements);
  }

  /**
   * Generate response using selected model
   */
  async generate(
    model: ModelConfig,
    context: AgentContext,
    options?: StreamOptions
  ): Promise<any> {
    const provider = this.providers.get(model.provider);
    if (!provider) {
      throw new Error(`Provider "${model.provider}" not found`);
    }

    // Add retry logic with fallbacks
    let lastError: Error | undefined;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await provider.generate(model, context, options);
      } catch (error) {
        lastError = error as Error;

        // If it's the last attempt, throw
        if (attempt === maxRetries - 1) {
          throw lastError;
        }

        // Try fallback model
        const fallback = this.findFallbackModel(model);
        if (fallback) {
          console.warn(
            `[ModelRouter] Attempt ${attempt + 1} failed for ${model.id}, trying fallback: ${fallback.id}`
          );
          model = fallback;
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
        } else {
          throw lastError;
        }
      }
    }

    throw lastError;
  }

  /**
   * Stream response using selected model
   */
  async *stream(
    model: ModelConfig,
    context: AgentContext,
    options?: StreamOptions
  ): AsyncIterable<any> {
    const provider = this.providers.get(model.provider);
    if (!provider) {
      throw new Error(`Provider "${model.provider}" not found`);
    }

    if (!provider.stream) {
      throw new Error(`Provider "${model.provider}" does not support streaming`);
    }

    yield* provider.stream(model, context, options);
  }

  /**
   * Find a fallback model for a given model
   */
  private findFallbackModel(current: ModelConfig): ModelConfig | undefined {
    // Try same provider, different model
    const provider = this.providers.get(current.provider);
    if (provider) {
      const sameProviderModel = provider.supportedModels.find(
        (m) => m.id !== current.id
      );
      if (sameProviderModel) return sameProviderModel;
    }

    // Try different provider
    for (const p of this.providers.values()) {
      if (p.name === current.provider) continue;

      const model = p.supportedModels[0];
      if (model) return model;
    }

    return undefined;
  }
}

/**
 * OpenAI Provider Adapter (example implementation)
 */
export class OpenAIProvider implements ProviderAdapter {
  name = "openai";
  supportedModels: ModelConfig[] = [
    {
      id: "gpt-4",
      provider: "openai",
      displayName: "GPT-4",
      capabilities: {
        streaming: true,
        vision: false,
        thinking: false,
        jsonMode: true,
        maxTokens: 8192,
        supportsTools: true,
      },
      pricing: {
        input: 0.03,
        output: 0.06,
      },
    },
    {
      id: "gpt-4-turbo",
      provider: "openai",
      displayName: "GPT-4 Turbo",
      capabilities: {
        streaming: true,
        vision: false,
        thinking: false,
        jsonMode: true,
        maxTokens: 128000,
        supportsTools: true,
      },
      pricing: {
        input: 0.01,
        output: 0.03,
      },
    },
    {
      id: "gpt-3.5-turbo",
      provider: "openai",
      displayName: "GPT-3.5 Turbo",
      capabilities: {
        streaming: true,
        vision: false,
        thinking: false,
        jsonMode: true,
        maxTokens: 16384,
        supportsTools: true,
      },
      pricing: {
        input: 0.0005,
        output: 0.0015,
      },
    },
  ];

  async generate(
    model: ModelConfig,
    context: AgentContext,
    options?: StreamOptions
  ): Promise<any> {
    // TODO: Implement actual OpenAI API call
    console.log(`[OpenAI] Generating with model: ${model.id}`);

    // Simulated response
    return {
      role: "assistant",
      content: [{ type: "text", text: "Response from OpenAI" }],
      timestamp: Date.now(),
      model: model.id,
      provider: model.provider,
      stopReason: "stop",
    };
  }

  validateModel(model: string): boolean {
    return this.supportedModels.some((m) => m.id === model);
  }
}

/**
 * Anthropic Provider Adapter (example implementation)
 */
export class AnthropicProvider implements ProviderAdapter {
  name = "anthropic";
  supportedModels: ModelConfig[] = [
    {
      id: "claude-3-opus",
      provider: "anthropic",
      displayName: "Claude 3 Opus",
      capabilities: {
        streaming: true,
        vision: true,
        thinking: false,
        jsonMode: true,
        maxTokens: 200000,
        supportsTools: true,
      },
      pricing: {
        input: 0.015,
        output: 0.075,
      },
    },
    {
      id: "claude-3-sonnet",
      provider: "anthropic",
      displayName: "Claude 3 Sonnet",
      capabilities: {
        streaming: true,
        vision: true,
        thinking: false,
        jsonMode: true,
        maxTokens: 200000,
        supportsTools: true,
      },
      pricing: {
        input: 0.003,
        output: 0.015,
      },
    },
  ];

  async generate(
    model: ModelConfig,
    context: AgentContext,
    options?: StreamOptions
  ): Promise<any> {
    // TODO: Implement actual Anthropic API call
    console.log(`[Anthropic] Generating with model: ${model.id}`);

    return {
      role: "assistant",
      content: [{ type: "text", text: "Response from Anthropic" }],
      timestamp: Date.now(),
      model: model.id,
      provider: model.provider,
      stopReason: "stop",
    };
  }

  validateModel(model: string): boolean {
    return this.supportedModels.some((m) => m.id === model);
  }
}
