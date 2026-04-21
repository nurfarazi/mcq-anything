import { renderQuizPage } from '../../src/ui/quiz-page';

type FetchInput = Parameters<typeof fetch>[0];

function assertContains(actual: string, expected: string, label: string): void {
  if (!actual.includes(expected)) {
    throw new Error(`${label}: expected output to include ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
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

function installFetch(handler: (input: FetchInput) => Promise<Response>): void {
  const globalLike = globalThis as typeof globalThis & { fetch?: typeof fetch };
  globalLike.fetch = (async (input: FetchInput) => handler(input)) as typeof fetch;
}

function installQuizResponse(
  questions: Array<{
    question: string;
    options: readonly [string, string, string, string];
    correctAnswer: 0 | 1 | 2 | 3;
    explanation: string;
  }>,
): void {
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

  assertContains(output, '<!doctype html>', `${label} includes a document shell`);
  assertContains(output, 'Quiz generation error', `${label} includes the error panel`);
  assertContains(output, 'Error: {{ model.error.code }}', `${label} includes the Vue error binding`);
  assertContains(output, expectedMessage, `${label} includes the error message`);
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

  assertContains(successOutput, '<!doctype html>', 'renders a successful quiz flow through the public app boundary');
  assertContains(successOutput, 'https://unpkg.com/vue@3/dist/vue.global.prod.js', 'loads Vue for the public app boundary');
  assertContains(successOutput, 'Practice one multiple-choice question at a time.', 'renders the hero copy');
  assertContains(successOutput, 'What is the capital of France?', 'renders the question text');
  assertContains(successOutput, 'Paris is the capital city of France.', 'renders the explanation text');
  assertContains(successOutput, 'Reveal answers', 'renders the primary action');

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

  assertContains(configErrorOutput, 'GENERATION_FAILED', 'renders app-safe configuration failures without leaking provider details');
  assertContains(configErrorOutput, 'Unable to configure quiz generation.', 'renders app-safe configuration failures without leaking provider details');

  installFetch(async () => {
    throw new Error('socket hang up');
  });

  delete globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

  const providerErrorOutput = await renderQuizPage({ topic: 'Science', questionCount: 1 });

  assertContains(providerErrorOutput, 'GENERATION_FAILED', 'renders app-safe provider failures without leaking transport details');
  assertContains(providerErrorOutput, 'Unable to generate quiz content.', 'renders app-safe provider failures without leaking transport details');

  restoreEnvironment();
}

void main().catch((error) => {
  restoreEnvironment();
  throw error;
});
