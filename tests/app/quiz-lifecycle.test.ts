import {
  generateAndStoreQuiz,
  getQuizSession,
  listPastQuizzes,
  submitQuizAttempt,
  type QuizLifecycleResult,
} from '../../src/app/quiz-lifecycle';
import type { QuizAttempt } from '../../src/app/quiz-attempt';
import type { QuizPersistencePort } from '../../src/app/quiz-store';
import type { QuizSession } from '../../src/app/quiz-session';

type FetchInput = Parameters<typeof fetch>[0];

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type GenerateShape = Expect<
  Equal<
    Awaited<ReturnType<typeof generateAndStoreQuiz>>,
    QuizLifecycleResult<QuizSession>
  >
>;

type ListShape = Expect<
  Equal<
    Awaited<ReturnType<typeof listPastQuizzes>>,
    QuizLifecycleResult<readonly QuizSession[]>
  >
>;

type GetShape = Expect<
  Equal<
    Awaited<ReturnType<typeof getQuizSession>>,
    QuizLifecycleResult<QuizSession | null>
  >
>;

type SubmitShape = Expect<
  Equal<
    Awaited<ReturnType<typeof submitQuizAttempt>>,
    QuizLifecycleResult<QuizAttempt>
  >
>;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertTrue(value: unknown, label: string): void {
  if (value !== true) {
    throw new Error(`${label}: expected true`);
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

async function main(): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalProviderEnv = globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

  const storeSessions: QuizSession[] = [];
  const storeAttempts: QuizAttempt[] = [];
  const store: QuizPersistencePort = {
    async saveSession(session) {
      storeSessions.push(session);
    },
    async listSessions() {
      return [...storeSessions];
    },
    async getSessionById(id) {
      return storeSessions.find((session) => session.id === id) ?? null;
    },
    async saveAttempt(attempt) {
      storeAttempts.push(attempt);
    },
    async listAttemptsBySessionId(sessionId) {
      return storeAttempts.filter((attempt) => attempt.sessionId === sessionId);
    },
  };

  globalThis.fetch = (async (input: FetchInput) => {
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
              question_text: 'What is the SI unit of force?',
              options: ['Newton', 'Joule', 'Watt', 'Pascal'] as const,
              correct_answer: 0,
              explanation_text: 'A newton is the SI unit used to measure force in physics.',
            },
          ],
        };
      },
    } as Response;
  }) as typeof fetch;

  delete globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

  const success = await generateAndStoreQuiz({ topic: 'Physics', questionCount: 1 }, store);

  if (!success.ok) {
    throw new Error('stores a generated quiz session when generation succeeds: expected success result');
  }

  assertTrue(success.value.id.length > 0, 'returns the stored session id after quiz generation');
  assertTrue(success.value.createdAt.length > 0, 'returns the stored session timestamp after quiz generation');
  assertTrue(success.value.topic === 'Physics', 'returns the stored session topic after quiz generation');
  assertDeepEqual(
    success.value.questions,
    [
      {
        question: 'What is the SI unit of force?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctAnswer: 0,
        explanation: 'A newton is the SI unit used to measure force in physics.',
      },
    ],
    'returns the stored session questions after quiz generation',
  );

  assertTrue(storeSessions.length === 1, 'persists exactly one quiz session after success');
  assertTrue(storeSessions[0]!.topic === 'Physics', 'stores the session topic');
  assertDeepEqual(
    storeSessions[0]!.questions,
    [
      {
        question: 'What is the SI unit of force?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        correctAnswer: 0,
        explanation: 'A newton is the SI unit used to measure force in physics.',
      },
    ],
    'stores the generated MCQ content in the session snapshot',
  );

  globalThis.fetch = (async (input: FetchInput) => {
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
              explanation_text: 'A valid explanation with enough detail to pass validation.',
            },
          ],
        };
      },
    } as Response;
  }) as typeof fetch;

  const failedGeneration = await generateAndStoreQuiz({ topic: 'Math', questionCount: 2 }, store);

  assertFailure(
    failedGeneration,
    'INVALID_MODEL_OUTPUT',
    'returns the generation failure without storing a session',
  );

  assertTrue(storeSessions.length === 1, 'does not add a session when generation fails');

  const submittedAttempt = await submitQuizAttempt(storeSessions[0]!, [0], store);

  if (!submittedAttempt.ok) {
    throw new Error('stores a scored quiz attempt when answers are valid: expected success result');
  }

  assertDeepEqual(
    submittedAttempt.value.answers,
    [0],
    'stores the submitted answer indexes on the attempt record',
  );

  assertDeepEqual(
    submittedAttempt.value.score,
    {
      correctCount: 1,
      totalQuestions: 1,
      percentage: 100,
    },
    'calculates the quiz score from submitted answers',
  );

  assertDeepEqual(
    submittedAttempt.value.questions,
    [
      {
        questionIndex: 0,
        question: 'What is the SI unit of force?',
        options: ['Newton', 'Joule', 'Watt', 'Pascal'],
        selectedAnswer: 0,
        correctAnswer: 0,
        isCorrect: true,
        explanation: 'A newton is the SI unit used to measure force in physics.',
      },
    ],
    'returns per-question feedback for a stored attempt',
  );

  assertTrue(storeAttempts.length === 1, 'persists exactly one quiz attempt after a valid submission');

  const invalidLengthAttempt = await submitQuizAttempt(storeSessions[0]!, [], store);

  assertFailure(
    invalidLengthAttempt,
    'INVALID_INPUT',
    'rejects quiz submissions that do not answer every question',
  );

  assertTrue(storeAttempts.length === 1, 'does not persist an attempt when the answer count is invalid');

  const invalidOptionAttempt = await submitQuizAttempt(storeSessions[0]!, [4], store);

  assertFailure(
    invalidOptionAttempt,
    'INVALID_INPUT',
    'rejects quiz submissions that use an out-of-range answer index',
  );

  assertTrue(storeAttempts.length === 1, 'does not persist an attempt when an answer index is invalid');

  const listed = await listPastQuizzes(store);

  assertDeepEqual(
    listed,
    { ok: true, value: storeSessions },
    'lists the stored quiz sessions through the lifecycle service',
  );

  const fetched = await getQuizSession(storeSessions[0]!.id, store);

  assertDeepEqual(
    fetched,
    { ok: true, value: storeSessions[0] },
    'retrieves a stored quiz session by id through the lifecycle service',
  );

  const failingStore: QuizPersistencePort = {
    async saveSession() {
      throw new Error('disk full');
    },
    async listSessions() {
      throw new Error('disk full');
    },
    async getSessionById() {
      throw new Error('disk full');
    },
    async saveAttempt() {
      throw new Error('disk full');
    },
    async listAttemptsBySessionId() {
      throw new Error('disk full');
    },
  };

  globalThis.fetch = (async (input: FetchInput) => {
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
              question_text: 'What is the SI unit of force?',
              options: ['Newton', 'Joule', 'Watt', 'Pascal'] as const,
              correct_answer: 0,
              explanation_text: 'A newton is the SI unit used to measure force in physics.',
            },
          ],
        };
      },
    } as Response;
  }) as typeof fetch;

  const storageFailure = await generateAndStoreQuiz({ topic: 'Physics', questionCount: 1 }, failingStore);

  assertFailure(
    storageFailure,
    'GENERATION_FAILED',
    'maps storage failures into app-safe generation failure results',
  );

  if (storageFailure.ok === false && storageFailure.error.message.includes('disk full')) {
    throw new Error('storage failure should not leak raw persistence errors');
  }

  const listFailure = await listPastQuizzes(failingStore);

  assertFailure(
    listFailure,
    'GENERATION_FAILED',
    'maps list failures into an app-safe lifecycle failure',
  );

  const getFailure = await getQuizSession('missing', failingStore);

  assertFailure(
    getFailure,
    'GENERATION_FAILED',
    'maps get failures into an app-safe lifecycle failure',
  );

  const attemptStorageFailure = await submitQuizAttempt(storeSessions[0]!, [0], failingStore);

  assertFailure(
    attemptStorageFailure,
    'GENERATION_FAILED',
    'maps attempt storage failures into an app-safe lifecycle failure',
  );

  if (attemptStorageFailure.ok === false && attemptStorageFailure.error.message.includes('disk full')) {
    throw new Error('attempt storage failure should not leak raw persistence errors');
  }

  globalThis.fetch = originalFetch;

  if (globalThis.process?.env) {
    if (originalProviderEnv === undefined) {
      delete globalThis.process.env.MCQ_ANYTHING_PROVIDER;
    } else {
      globalThis.process.env.MCQ_ANYTHING_PROVIDER = originalProviderEnv;
    }
  }
}

void main().catch((error) => {
  throw error;
});
