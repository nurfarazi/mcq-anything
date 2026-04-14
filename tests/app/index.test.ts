import { generateQuiz } from '../../src/app';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type ExportShape = Expect<Equal<typeof generateQuiz, typeof import('../../src/app/quiz-generation').generateQuiz>>;
type InputShape = Expect<Equal<Parameters<typeof generateQuiz>[0], import('../../src/app/quiz-types').QuizGenerationInput>>;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

async function main(): Promise<void> {
  const globalLike = globalThis as typeof globalThis & {
    fetch?: typeof fetch;
    process?: { env?: Record<string, string | undefined> };
  };

  const originalFetch = globalLike.fetch;
  const originalProviderEnv = globalLike.process?.env?.MCQ_ANYTHING_PROVIDER;

  globalLike.fetch = (async (input: RequestInfo | URL) => {
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
              question: 'What is Physics?',
              options: ['A', 'B', 'C', 'D'] as const,
              correctAnswer: 0,
              explanation: 'Example explanation.',
            },
          ],
        };
      },
    } as Response;
  }) as typeof fetch;

  delete globalLike.process?.env?.MCQ_ANYTHING_PROVIDER;

  const result = await generateQuiz({ topic: 'Physics', questionCount: 1 });

  assertDeepEqual(
    result,
    {
      ok: true,
      value: {
        questions: [
          {
            question: 'What is Physics?',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 0,
            explanation: 'Example explanation.',
          },
        ],
      },
    },
    'delegates the app entry point directly to the quiz-generation use case',
  );

  globalLike.fetch = originalFetch;

  if (globalLike.process?.env) {
    if (originalProviderEnv === undefined) {
      delete globalLike.process.env.MCQ_ANYTHING_PROVIDER;
    } else {
      globalLike.process.env.MCQ_ANYTHING_PROVIDER = originalProviderEnv;
    }
  }
}

void main().catch((error) => {
  throw error;
});
