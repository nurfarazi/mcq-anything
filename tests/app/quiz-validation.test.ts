import { validateQuizGenerationResponse } from '../../src/app/quiz-validation';

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

const validResponse = {
  questions: [
    {
      question: 'What is the chemical symbol for water?',
      options: ['H2O', 'CO2', 'O2', 'NaCl'] as const,
      correctAnswer: 0,
      explanation: 'H2O is the chemical formula for water.',
    },
    {
      question: 'How many planets are in the solar system?',
      options: ['7', '8', '9', '10'] as const,
      correctAnswer: 1,
      explanation: 'There are eight recognized planets.',
    },
  ],
} as const;

assertDeepEqual(
  validateQuizGenerationResponse(validResponse, 2),
  { ok: true, value: validResponse },
  'accepts a fully valid response that matches the requested count',
);

assertFailure(
  validateQuizGenerationResponse(validResponse, 1),
  'INVALID_MODEL_OUTPUT',
  'rejects responses whose question count does not match the request',
);

assertFailure(
  validateQuizGenerationResponse(
    {
      questions: [
        {
          question: 'Broken options',
          options: ['A', 'B', 'C'] as unknown as readonly [string, string, string, string],
          correctAnswer: 0,
          explanation: 'This item is malformed.',
        },
      ],
    } as unknown as Parameters<typeof validateQuizGenerationResponse>[0],
    1,
  ),
  'INVALID_MODEL_OUTPUT',
  'rejects questions that do not contain exactly four options',
);

assertFailure(
  validateQuizGenerationResponse(
    {
      questions: [
        {
          question: 'Broken answer index',
          options: ['A', 'B', 'C', 'D'] as const,
          correctAnswer: 4 as unknown as 0 | 1 | 2 | 3,
          explanation: 'This item is malformed.',
        },
      ],
    } as unknown as Parameters<typeof validateQuizGenerationResponse>[0],
    1,
  ),
  'INVALID_MODEL_OUTPUT',
  'rejects questions with an out-of-range correctAnswer index',
);

assertFailure(
  validateQuizGenerationResponse(
    {
      questions: [
        {
          question: 'Broken explanation',
          options: ['A', 'B', 'C', 'D'] as const,
          correctAnswer: 1,
          explanation: '   ',
        },
      ],
    } as unknown as Parameters<typeof validateQuizGenerationResponse>[0],
    1,
  ),
  'INVALID_MODEL_OUTPUT',
  'rejects questions with an empty explanation',
);
