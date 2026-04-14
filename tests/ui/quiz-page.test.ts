import { renderQuizPage } from '../../src/ui/quiz-page';

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

const originalFetch = globalThis.fetch;
const originalProviderEnv = globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

function restoreEnvironment(): void {
  const globalLike = globalThis as typeof globalThis & {
    fetch?: typeof fetch;
    process?: { env?: Record<string, string | undefined> };
  };

  globalLike.fetch = originalFetch;

  if (globalLike.process?.env) {
    if (originalProviderEnv === undefined) {
      delete globalLike.process.env.MCQ_ANYTHING_PROVIDER;
    } else {
      globalLike.process.env.MCQ_ANYTHING_PROVIDER = originalProviderEnv;
    }
  }
}

function installFetch(handler: (input: RequestInfo | URL) => Promise<Response>): void {
  const globalLike = globalThis as typeof globalThis & { fetch?: typeof fetch };
  globalLike.fetch = (async (input: RequestInfo | URL) => handler(input)) as typeof fetch;
}

function installQuizResponse(
  questions: Array<{
    question: string;
    options: readonly [string, string, string, string];
    correctAnswer: 0 | 1 | 2 | 3;
    explanation: string;
  }>,
): void {
  installFetch(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (!url.includes('127.0.0.1:1234/v1/mcq')) {
      throw new Error(`unexpected endpoint: ${url}`);
    }

    return {
      ok: true,
      status: 200,
      async json() {
        return {
          questions: questions.map((question) => ({
            question_text: question.question,
            options: question.options,
            correct_answer: question.correctAnswer,
            explanation_text: question.explanation,
          })),
        };
      },
    } as Response;
  });
}

async function expectRenderedError(
  topic: string,
  questionCount: number,
  expectedMessage: string,
  label: string,
): Promise<void> {
  const output = await renderQuizPage({ topic, questionCount });

  assertEqual(
    output,
    [
      'Error: INVALID_MODEL_OUTPUT',
      `Message: ${expectedMessage}`,
    ].join('\n'),
    label,
  );
}

async function main(): Promise<void> {
  installQuizResponse([
    {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
      correctAnswer: 2,
      explanation: 'Paris is the capital city of France.',
    },
  ]);

  delete globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

  const successOutput = await renderQuizPage({ topic: 'Geography', questionCount: 1 });

  assertEqual(
    successOutput,
    [
      'Generated MCQs',
      '',
      '1. What is the capital of France?',
      '  A. Berlin',
      '  B. Madrid',
      '  C. Paris',
      '  D. Rome',
      '  Correct answer: C',
      '  Explanation: Paris is the capital city of France.',
    ].join('\n'),
    'renders a successful quiz flow through the public app boundary',
  );

  installQuizResponse([
    {
      question: 'Which planet is closest to the Sun?',
      options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
      correctAnswer: 0,
      explanation: 'Mercury is the closest planet to the Sun in our solar system.',
    },
    {
      question: 'Which planet is closest to the Sun?',
      options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
      correctAnswer: 0,
      explanation: 'Mercury is the closest planet to the Sun in our solar system.',
    },
  ]);

  await expectRenderedError(
    'Astronomy',
    2,
    'Returned questions contain duplicate or near-duplicate wording.',
    'renders duplicate questions as an app-safe quality error',
  );

  installQuizResponse([
    {
      question: 'What planet is nearest to the Sun?',
      options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
      correctAnswer: 0,
      explanation: 'Mercury is the closest planet to the Sun in our solar system.',
    },
    {
      question: 'Which planet is closest to the Sun?',
      options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
      correctAnswer: 0,
      explanation: 'Mercury is the closest planet to the Sun in our solar system.',
    },
  ]);

  await expectRenderedError(
    'Astronomy',
    2,
    'Returned questions contain duplicate or near-duplicate wording.',
    'renders near-duplicate questions as an app-safe quality error',
  );

  installQuizResponse([
    {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
      correctAnswer: 2,
      explanation: 'Paris is the capital city of France.',
    },
  ]);

  await expectRenderedError(
    'Astronomy',
    1,
    'Returned questions are not sufficiently related to the requested topic.',
    'renders off-topic questions as an app-safe quality error',
  );

  installQuizResponse([
    {
      question: 'Which planet is closest to the Sun?',
      options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
      correctAnswer: 0,
      explanation: 'It is correct.',
    },
  ]);

  await expectRenderedError(
    'Astronomy',
    1,
    'Returned questions contain weak or non-informative explanations.',
    'renders weak explanations as an app-safe quality error',
  );

  installQuizResponse([
    {
      question: 'Which planet is closest to the Sun?',
      options: ['Mercury', 'Mercury', 'Earth', 'Mars'] as const,
      correctAnswer: 0,
      explanation: 'Mercury is the closest planet to the Sun in our solar system.',
    },
  ]);

  await expectRenderedError(
    'Astronomy',
    1,
    'Returned questions contain inconsistent answer or option relationships.',
    'renders inconsistent answer and option relationships as an app-safe quality error',
  );

  globalThis.process!.env.MCQ_ANYTHING_PROVIDER = 'anthropic';

  const configErrorOutput = await renderQuizPage({ topic: 'Science', questionCount: 1 });

  assertEqual(
    configErrorOutput,
    [
      'Error: GENERATION_FAILED',
      'Message: Unable to configure quiz generation.',
    ].join('\n'),
    'renders app-safe configuration failures without leaking provider details',
  );

  installFetch(async () => {
    throw new Error('socket hang up');
  });

  delete globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

  const providerErrorOutput = await renderQuizPage({ topic: 'Science', questionCount: 1 });

  assertEqual(
    providerErrorOutput,
    [
      'Error: GENERATION_FAILED',
      'Message: Unable to generate quiz content.',
    ].join('\n'),
    'renders app-safe provider failures without leaking transport details',
  );

  restoreEnvironment();
}

void main().catch((error) => {
  restoreEnvironment();
  throw error;
});
