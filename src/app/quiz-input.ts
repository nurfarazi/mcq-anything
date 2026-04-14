import type { QuizGenerationInput, QuizGenerationResult } from './quiz-types';
import { APP_ERROR_CODES } from './quiz-types';

export const MAX_QUIZ_QUESTION_COUNT = 10;

function invalidInput(message: string): QuizGenerationResult {
  return {
    ok: false,
    error: {
      code: APP_ERROR_CODES[0],
      message,
    },
  };
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

/**
 * Normalize and validate caller input before any generation work begins.
 */
export function normalizeQuizGenerationInput(
  input: QuizGenerationInput,
): QuizGenerationResult | { ok: true; value: QuizGenerationInput } {
  const topic = input.topic.trim();

  if (topic.length === 0) {
    return invalidInput('Topic must be a non-empty string after trimming.');
  }

  if (!isPositiveInteger(input.questionCount)) {
    return invalidInput('Question count must be a positive integer.');
  }

  if (input.questionCount > MAX_QUIZ_QUESTION_COUNT) {
    return invalidInput(
      `Question count must not exceed ${MAX_QUIZ_QUESTION_COUNT}.`,
    );
  }

  return {
    ok: true,
    value: {
      topic,
      questionCount: input.questionCount,
    },
  };
}
