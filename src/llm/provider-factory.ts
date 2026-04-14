import type { ProviderKey } from './config';
import type { MCQGenerationRequest, MCQGenerationResponse } from './types';
import {
  requestMcqGenerationFromLmStudio,
  type LmStudioTransportOptions,
} from './providers/lm-studio';

export interface McqProvider {
  generate(request: MCQGenerationRequest): Promise<MCQGenerationResponse>;
}

export interface ProviderFactoryOptions {
  lmStudio: LmStudioTransportOptions;
}

function assertUnsupportedProvider(provider: never): never {
  throw new Error(`Provider is not supported yet: ${String(provider)}`);
}

/**
 * Create the active provider implementation from the resolved provider key.
 *
 * This factory only routes to concrete provider adapters. It does not perform
 * any business-logic branching or config parsing.
 */
export function createProvider(
  provider: ProviderKey,
  options: ProviderFactoryOptions,
): McqProvider {
  switch (provider) {
    case 'lm-studio':
      return {
        generate: (request) =>
          requestMcqGenerationFromLmStudio(request, options.lmStudio),
      };
    case 'openai':
      throw new Error('OpenAI provider is not implemented yet');
    default:
      return assertUnsupportedProvider(provider);
  }
}