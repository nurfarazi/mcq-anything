import type { MCQGenerationResponse } from '../llm';
import { APP_ERROR_CODES, type QuizGenerationResult } from './quiz-types';

function invalidModelOutput(message: string): QuizGenerationResult {
  return {
    ok: false,
    error: {
      code: APP_ERROR_CODES[2],
      message,
    },
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidCorrectAnswerIndex(value: unknown): value is 0 | 1 | 2 | 3 {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

function isValidQuestion(question: unknown): question is MCQGenerationResponse['questions'][number] {
  if (typeof question !== 'object' || question === null) {
    return false;
  }

  const record = question as Record<string, unknown>;

  return (
    isNonEmptyString(record.question) &&
    Array.isArray(record.options) &&
    record.options.length === 4 &&
    record.options.every(isNonEmptyString) &&
    isValidCorrectAnswerIndex(record.correctAnswer) &&
    isNonEmptyString(record.explanation)
  );
}

/**
 * Validate returned MCQs before the app presents them to the caller.
 */
export function validateQuizGenerationResponse(
  response: MCQGenerationResponse,
  requestedQuestionCount: number,
): QuizGenerationResult | { ok: true; value: MCQGenerationResponse } {
  if (!Number.isInteger(requestedQuestionCount) || requestedQuestionCount <= 0) {
    return invalidModelOutput('Requested question count must be a positive integer.');
  }

  if (!response || !Array.isArray(response.questions)) {
    return invalidModelOutput('Response must contain a questions array.');
  }

  if (response.questions.length !== requestedQuestionCount) {
    return invalidModelOutput('Returned question count did not match the request.');
  }

  if (!response.questions.every(isValidQuestion)) {
    return invalidModelOutput('Returned MCQs contained malformed items.');
  }

  return {
    ok: true,
    value: response,
  };
}
