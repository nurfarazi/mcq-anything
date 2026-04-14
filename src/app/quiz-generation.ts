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

type NormalizedQuizInput = {
  ok: true;
  value: QuizGenerationInput;
};

type ConfiguredProviderResult =
  | { ok: true; provider: McqProvider }
  | { ok: false; error: AppError };

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

function isNormalizedQuizInput(
  value: QuizGenerationResult | NormalizedQuizInput,
): value is NormalizedQuizInput {
  return value.ok && 'topic' in value.value;
}

function createConfiguredProvider(): ConfiguredProviderResult {
  try {
    const providerConfig = parseProviderConfig();
    const providerKey = resolveActiveProviderKey(providerConfig);

    return {
      ok: true,
      provider: createProvider(providerKey, buildProviderFactoryOptions()),
    };
  } catch {
    return {
      ok: false,
      error: {
        code: 'GENERATION_FAILED',
        message: 'Unable to configure quiz generation.',
      },
    };
  }
}

/**
 * Orchestrate the quiz generation workflow using only the public LLM boundary.
 */
export async function generateQuiz(
  input: QuizGenerationInput,
): Promise<QuizGenerationResult> {
  const normalizedInput = normalizeQuizGenerationInput(input);

  if (!isNormalizedQuizInput(normalizedInput)) {
    return normalizedInput;
  }

  const providerResult = createConfiguredProvider();

  if (providerResult.ok === false) {
    return {
      ok: false,
      error: providerResult.error,
    };
  }

  const provider = providerResult.provider;

  let generated;

  try {
    generated = await provider.generate(normalizedInput.value);
  } catch {
    return failure('GENERATION_FAILED', 'Unable to generate quiz content.');
  }

  const validated = validateQuizGenerationResponse(
    generated,
    normalizedInput.value.topic,
    normalizedInput.value.questionCount,
  );

  if (!validated.ok) {
    return validated;
  }

  return success(validated.value);
}
