import { generateQuiz, submitQuizAttempt } from '../../src/app';

type FetchInput = Parameters<typeof fetch>[0];

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type ExportShape = Expect<Equal<typeof generateQuiz, typeof import('../../src/app/quiz-generation').generateQuiz>>;
type InputShape = Expect<Equal<Parameters<typeof generateQuiz>[0], import('../../src/app/quiz-types').QuizGenerationInput>>;
type SubmitShape = Expect<Equal<typeof submitQuizAttempt, typeof import('../../src/app/quiz-lifecycle').submitQuizAttempt>>;

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

  globalLike.fetch = (async (input: FetchInput) => {
    const url = String(input);

    if (!url.includes('7321/api/v1/chat')) {
      throw new Error(`unexpected endpoint: ${url}`);
    }

    return {
      ok: true,
      status: 200,
      async json() {
        return {
          output: JSON.stringify({
            questions: [
              {
                question_text: 'What is the SI unit of force?',
                options: ['Newton', 'Joule', 'Watt', 'Pascal'],
                correct_answer: 0,
                explanation_text: 'A newton is the SI unit used to measure force in physics.',
              },
            ],
          }),
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
            question: 'What is the SI unit of force?',
            options: ['Newton', 'Joule', 'Watt', 'Pascal'],
            correctAnswer: 0,
            explanation: 'A newton is the SI unit used to measure force in physics.',
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
