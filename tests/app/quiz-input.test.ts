import { MAX_QUIZ_QUESTION_COUNT, normalizeQuizGenerationInput } from '../../src/app/quiz-input';

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertFailure(result: unknown, code: string, label: string): void {
  if (typeof result !== 'object' || result === null || !('ok' in result) || result.ok !== false) {
    throw new Error(`${label}: expected failure result`);
  }

  const error = (result as { error?: { code?: string } }).error;

  if (!error || error.code !== code) {
    throw new Error(`${label}: expected error code ${code}`);
  }
}

assertDeepEqual(
  normalizeQuizGenerationInput({ topic: '  Chemistry  ', questionCount: 3 }),
  { ok: true, value: { topic: 'Chemistry', questionCount: 3 } },
  'trims topic and preserves a valid question count',
);

assertFailure(
  normalizeQuizGenerationInput({ topic: '   ', questionCount: 3 }),
  'INVALID_INPUT',
  'rejects blank topics after trimming',
);

assertFailure(
  normalizeQuizGenerationInput({ topic: 'Biology', questionCount: 0 }),
  'INVALID_INPUT',
  'rejects non-positive question counts',
);

assertFailure(
  normalizeQuizGenerationInput({ topic: 'Biology', questionCount: 2.5 }),
  'INVALID_INPUT',
  'rejects non-integer question counts',
);

assertFailure(
  normalizeQuizGenerationInput({ topic: 'Biology', questionCount: MAX_QUIZ_QUESTION_COUNT + 1 }),
  'INVALID_INPUT',
  'enforces the small v1 question-count ceiling',
);
