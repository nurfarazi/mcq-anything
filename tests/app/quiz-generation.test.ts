import { generateQuiz } from '../../src/app/quiz-generation';

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
  handler: (input: RequestInfo | URL) => Promise<Response>,
): void {
  const globalLike = globalThis as typeof globalThis & {
    fetch?: typeof fetch;
  };

  globalLike.fetch = (async (input: RequestInfo | URL) => handler(input)) as typeof fetch;
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
          questions: [
            {
              question: 'What is Astronomy?',
              options: ['A', 'B', 'C', 'D'] as const,
              correctAnswer: 1,
              explanation: 'Example explanation.',
            },
            {
              question: 'Second question?',
              options: ['A', 'B', 'C', 'D'] as const,
              correctAnswer: 2,
              explanation: 'Example explanation.',
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
            question: 'What is Astronomy?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 1,
            explanation: 'Example explanation.',
          },
          {
            question: 'Second question?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 2,
            explanation: 'Example explanation.',
          },
        ],
      },
    },
    'returns a successful quiz result on the happy path',
  );

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
          questions: [
            {
              question: 'Only one question',
              options: ['A', 'B', 'C', 'D'] as const,
              correctAnswer: 0,
              explanation: 'Example explanation.',
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
