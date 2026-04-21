import { generateQuiz } from '../../src/app/quiz-generation';

type FetchInput = Parameters<typeof fetch>[0];

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type ResultShape = Expect<Equal<Awaited<ReturnType<typeof generateQuiz>>, import('../../src/app/quiz-types').QuizGenerationResult>>;
type InputShape = Expect<Equal<Parameters<typeof generateQuiz>[0], import('../../src/app/quiz-types').QuizGenerationInput>>;

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

  const error = (result as { error?: { code?: string; message?: string } }).error;

  if (!error || error.code !== code) {
    throw new Error(`${label}: expected error code ${code}`);
  }
}

const originalFetch = globalThis.fetch;
const originalProviderEnv = globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

function installFetch(
  handler: (input: FetchInput) => Promise<Response>,
): void {
  const globalLike = globalThis as typeof globalThis & {
    fetch?: typeof fetch;
  };

  globalLike.fetch = (async (input: FetchInput) => handler(input)) as typeof fetch;
}

function restoreEnv(): void {
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

async function main(): Promise<void> {
  installFetch(async (input: FetchInput) => {
    const url = String(input);

    if (!url.includes('127.0.0.1:1234/v1/mcq')) {
      throw new Error(`unexpected endpoint: ${url}`);
    }

    return {
      ok: true,
      status: 200,
      async json() {
        return {
          questions: [
            {
              question_text: 'Which planet is closest to the Sun?',
              options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
              correct_answer: 0,
              explanation_text: 'Mercury is the closest planet to the Sun in our solar system.',
            },
            {
              question_text: 'What is the name of our galaxy?',
              options: ['Andromeda', 'Milky Way', 'Sombrero', 'Whirlpool'] as const,
              correct_answer: 1,
              explanation_text: 'Our solar system is located in the Milky Way galaxy.',
            },
          ],
        };
      },
    } as Response;
  });
  delete globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

  const success = await generateQuiz({ topic: '  Astronomy  ', questionCount: 2 });

  assertDeepEqual(
    success,
    {
      ok: true,
      value: {
        questions: [
          {
            question: 'Which planet is closest to the Sun?',
            options: ['Mercury', 'Venus', 'Earth', 'Mars'],
            correctAnswer: 0,
            explanation: 'Mercury is the closest planet to the Sun in our solar system.',
          },
          {
            question: 'What is the name of our galaxy?',
            options: ['Andromeda', 'Milky Way', 'Sombrero', 'Whirlpool'],
            correctAnswer: 1,
            explanation: 'Our solar system is located in the Milky Way galaxy.',
          },
        ],
      },
    },
    'returns a successful quiz result on the happy path',
  );

  installFetch(async (input: FetchInput) => {
    const url = String(input);

    if (!url.includes('127.0.0.1:1234/v1/mcq')) {
      throw new Error(`unexpected endpoint: ${url}`);
    }

    return {
      ok: true,
      status: 200,
      async json() {
        return {
          questions: [
            {
              question_text: 'Only one question',
              options: ['A', 'B', 'C', 'D'] as const,
              correct_answer: 0,
              explanation_text: 'Example explanation with enough detail to be valid.',
            },
          ],
        };
      },
    } as Response;
  });

  const invalidOutput = await generateQuiz({ topic: 'Math', questionCount: 2 });

  assertFailure(
    invalidOutput,
    'INVALID_MODEL_OUTPUT',
    'rejects model output that does not match the requested question count',
  );

    installFetch(async (input: FetchInput) => {
        const url = String(input);

        if (!url.includes('127.0.0.1:1234/v1/mcq')) {
            throw new Error(`unexpected endpoint: ${url}`);
        }

        return {
            ok: true,
            status: 200,
            async json() {
                return {
                    questions: [
                        {
                      question_text: 'What is the capital of France?',
                      options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
                      correct_answer: 2,
                      explanation_text: 'Paris is the capital city of France.',
                        },
                    ],
                };
            },
        } as Response;
    });

    const qualityFailure = await generateQuiz({ topic: 'Astronomy', questionCount: 1 });

    assertFailure(
        qualityFailure,
        'INVALID_MODEL_OUTPUT',
        'rejects off-topic model output through the generation use case',
    );

  installFetch(async () => {
    throw new Error('provider exploded');
  });

  const generationFailure = await generateQuiz({ topic: 'Math', questionCount: 2 });

  assertFailure(
    generationFailure,
    'GENERATION_FAILED',
    'maps provider failures into app-safe errors',
  );

  const message =
    generationFailure && typeof generationFailure === 'object' && 'error' in generationFailure
      ? (generationFailure as { error?: { message?: string } }).error?.message
      : undefined;

  if (message && message.includes('provider exploded')) {
    throw new Error('provider failure should not leak raw provider error text');
  }

  globalThis.process!.env.MCQ_ANYTHING_PROVIDER = 'anthropic';

  const configFailure = await generateQuiz({ topic: 'Science', questionCount: 1 });

  assertFailure(
    configFailure,
    'GENERATION_FAILED',
    'maps invalid provider config to an app-safe error result',
  );

  const configMessage =
    configFailure && typeof configFailure === 'object' && 'error' in configFailure
      ? (configFailure as { error?: { message?: string } }).error?.message
      : undefined;

  if (configMessage && configMessage.includes('Invalid provider key')) {
    throw new Error('provider config error text should not leak to callers');
  }

  delete globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

  const invalidInput = await generateQuiz({ topic: '   ', questionCount: 2 });

  assertFailure(
    invalidInput,
    'INVALID_INPUT',
    'returns app-safe input errors without invoking the provider',
  );

  restoreEnv();
}

void main().catch((error) => {
  restoreEnv();
  throw error;
});
