import { createApiHandler } from '../../src/api/api-handler';
import type { QuizPersistencePort } from '../../src/app/quiz-store';
import type { QuizSession } from '../../src/app/quiz-session';

type FetchInput = Parameters<typeof fetch>[0];

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

async function main(): Promise<void> {
  const healthHandler = createApiHandler();
  const response = await healthHandler(new Request('http://localhost/health'));

  assertEqual(response.status, 200, 'returns a successful status for health checks');
  assertEqual(await response.json(), { status: 'ok' }, 'returns a simple health payload');

  const rootResponse = await healthHandler(new Request('http://localhost/'));

  assertEqual(rootResponse.status, 200, 'returns a successful status for the root path');
  assertEqual(await rootResponse.json(), { status: 'ok' }, 'returns the same health payload at the root path');

  const storedSessions: QuizSession[] = [];
  const store: QuizPersistencePort = {
    async saveSession(session) {
      storedSessions.push(session);
    },
    async listSessions() {
      return [...storedSessions];
    },
    async getSessionById(id) {
      return storedSessions.find((session) => session.id === id) ?? null;
    },
  };

  const handler = createApiHandler({ store });

  const invalidInputResponse = await handler(
    new Request('http://localhost/quizzes', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ topic: 123, questionCount: 'two' }),
    }),
  );

  assertEqual(invalidInputResponse.status, 400, 'rejects malformed quiz requests');
  assertEqual(
    await invalidInputResponse.json(),
    {
      ok: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Request body must include a topic string and questionCount number.',
      },
    },
    'returns a safe invalid-input payload',
  );

  const originalFetch = globalThis.fetch;
  const originalProviderEnv = globalThis.process?.env?.MCQ_ANYTHING_PROVIDER;

  try {
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

    const quizResponse = await handler(
      new Request('http://localhost/quizzes', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ topic: 'Physics', questionCount: 1 }),
      }),
    );

    assertEqual(quizResponse.status, 201, 'creates a quiz resource through the API');
    assertEqual(
      await quizResponse.json(),
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
      'returns the generated quiz payload',
    );

    assertEqual(storedSessions.length, 1, 'persists the generated quiz session');

    const listResponse = await handler(new Request('http://localhost/quizzes'));

    assertEqual(listResponse.status, 200, 'lists stored quizzes through the API');
    assertEqual(
      await listResponse.json(),
      {
        ok: true,
        value: storedSessions,
      },
      'returns the stored sessions payload',
    );

    const storedSession = storedSessions[0];

    if (!storedSession) {
      throw new Error('expected a stored session after quiz creation');
    }

    const sessionResponse = await handler(new Request(`http://localhost/quizzes/${storedSession.id}`));

    assertEqual(sessionResponse.status, 200, 'loads a stored quiz by id through the API');
    assertEqual(
      await sessionResponse.json(),
      {
        ok: true,
        value: storedSession,
      },
      'returns the stored session payload',
    );

    const missingResponse = await handler(new Request('http://localhost/quizzes/missing'));

    assertEqual(missingResponse.status, 404, 'returns a not-found status for missing quizzes');
    assertEqual(
      await missingResponse.json(),
      {
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Quiz not found: missing',
        },
      },
      'returns a safe not-found payload',
    );
  } finally {
    globalThis.fetch = originalFetch;

    if (globalThis.process?.env) {
      if (originalProviderEnv === undefined) {
        delete globalThis.process.env.MCQ_ANYTHING_PROVIDER;
      } else {
        globalThis.process.env.MCQ_ANYTHING_PROVIDER = originalProviderEnv;
      }
    }
  }
}

void main().catch((error) => {
  throw error;
});
