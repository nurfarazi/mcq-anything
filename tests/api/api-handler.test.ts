import { createApiHandler } from '../../src/api/api-handler';
import type { QuizAttempt } from '../../src/app/quiz-attempt';
import type { QuizPersistencePort } from '../../src/app/quiz-store';
import type { QuizSession } from '../../src/app/quiz-session';
import { renderHomePageHtml } from '../../src/ui/home-page';

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
  assertEqual(rootResponse.headers.get('content-type'), 'text/html; charset=utf-8', 'returns a browser-friendly content type at the root path');
  assertEqual(await rootResponse.text(), renderHomePageHtml(), 'returns the landing page HTML at the root path');

  const storedSessions: QuizSession[] = [];
  const storedAttempts: QuizAttempt[] = [];
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
    async saveAttempt(attempt) {
      storedAttempts.push(attempt);
    },
    async listAttemptsBySessionId(sessionId) {
      return storedAttempts.filter((attempt) => attempt.sessionId === sessionId);
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
    assertEqual(await quizResponse.json(), { ok: true, value: storedSessions[0] }, 'returns the stored quiz session payload');

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

    const playResponse = await handler(new Request(`http://localhost/quizzes/${storedSession.id}/play`));
    const playHtml = await playResponse.text();

    assertEqual(playResponse.status, 200, 'renders a browser play page for a stored quiz session');
    assertEqual(playResponse.headers.get('content-type'), 'text/html; charset=utf-8', 'returns an HTML content type for the play route');
    assertEqual(playHtml.includes('Question 1 of 1'), true, 'renders question progress in the browser play page');
    assertEqual(playHtml.includes('Submit answers'), true, 'renders the quiz submission control in the browser play page');
    assertEqual(playHtml.includes('What is the SI unit of force?'), true, 'renders the stored quiz question in the browser play page');

    const submitAttemptResponse = await handler(
      new Request(`http://localhost/quizzes/${storedSession.id}/attempts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ answers: [0] }),
      }),
    );

    assertEqual(submitAttemptResponse.status, 201, 'submits a scored attempt through the API');
    assertEqual(
      await submitAttemptResponse.json(),
      {
        ok: true,
        value: storedAttempts[0],
      },
      'returns the stored scored attempt payload',
    );

    assertEqual(storedAttempts.length, 1, 'persists the submitted attempt');

    const invalidAttemptResponse = await handler(
      new Request(`http://localhost/quizzes/${storedSession.id}/attempts`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ answers: [] }),
      }),
    );

    assertEqual(invalidAttemptResponse.status, 400, 'rejects invalid attempt payloads');
    assertEqual(
      await invalidAttemptResponse.json(),
      {
        ok: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'All questions must be answered before submitting the quiz.',
        },
      },
      'returns a safe invalid-attempt payload',
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

    const missingPlayResponse = await handler(new Request('http://localhost/quizzes/missing/play'));

    assertEqual(missingPlayResponse.status, 404, 'returns a not-found status for a missing play page');

    const missingAttemptResponse = await handler(
      new Request('http://localhost/quizzes/missing/attempts', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ answers: [0] }),
      }),
    );

    assertEqual(missingAttemptResponse.status, 404, 'returns a not-found status for missing attempt submissions');
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
