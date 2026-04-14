import {
  createProvider,
  parseProviderConfig,
  resolveActiveProviderKey,
  type McqProvider,
  type ProviderFactoryOptions,
} from '../llm';
import { normalizeQuizGenerationInput } from './quiz-input';
import { validateQuizGenerationResponse } from './quiz-validation';
import type {
  AppError,
  QuizGenerationInput,
  QuizGenerationResult,
  QuizGenerationSuccess,
} from './quiz-types';

const DEFAULT_LM_STUDIO_ENDPOINT = 'http://127.0.0.1:1234/v1/mcq';

function success(value: QuizGenerationSuccess): QuizGenerationResult {
  return { ok: true, value };
}

function failure(code: AppError['code'], message: string): QuizGenerationResult {
  return {
    ok: false,
    error: { code, message },
  };
}

function buildProviderFactoryOptions(): ProviderFactoryOptions {
  const processLike = globalThis as {
    process?: { env?: Record<string, string | undefined> };
  };

  return {
    lmStudio: {
      endpoint:
        processLike.process?.env?.MCQ_ANYTHING_LM_STUDIO_ENDPOINT ??
        DEFAULT_LM_STUDIO_ENDPOINT,
    },
  };
}

function setupFailure(): QuizGenerationResult {
  return failure('GENERATION_FAILED', 'Unable to configure quiz generation.');
}

function createConfiguredProvider(): McqProvider | QuizGenerationResult {
  try {
    const providerConfig = parseProviderConfig();
    const providerKey = resolveActiveProviderKey(providerConfig);

    return createProvider(providerKey, buildProviderFactoryOptions());
  } catch {
    return setupFailure();
  }
}

/**
 * Orchestrate the quiz generation workflow using only the public LLM boundary.
 */
export async function generateQuiz(
  input: QuizGenerationInput,
): Promise<QuizGenerationResult> {
  const normalizedInput = normalizeQuizGenerationInput(input);

  if (!normalizedInput.ok) {
    return normalizedInput;
  }

  const provider = createConfiguredProvider();

  if ('ok' in provider && provider.ok === false) {
    return provider;
  }

  let generated;

  try {
    generated = await provider.generate(normalizedInput.value);
  } catch {
    return failure('GENERATION_FAILED', 'Unable to generate quiz content.');
  }

  const validated = validateQuizGenerationResponse(
    generated,
    normalizedInput.value.questionCount,
  );

  if (!validated.ok) {
    return validated;
  }

  return success(validated.value);
}
