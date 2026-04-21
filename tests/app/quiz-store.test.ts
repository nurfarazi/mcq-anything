import type { QuizPersistencePort } from '../../src/app/quiz-store';
import { createQuizAttempt } from '../../src/app/quiz-attempt';
import { scoreQuizAnswers } from '../../src/app/quiz-scoring';
import { createQuizSession } from '../../src/app/quiz-session';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type PortShape = Expect<
  Equal<
    QuizPersistencePort,
    {
      saveSession(session: import('../../src/app/quiz-session').QuizSession): Promise<void>;
      listSessions(): Promise<readonly import('../../src/app/quiz-session').QuizSession[]>;
      getSessionById(id: string): Promise<import('../../src/app/quiz-session').QuizSession | null>;
      saveAttempt(attempt: import('../../src/app/quiz-attempt').QuizAttempt): Promise<void>;
      listAttemptsBySessionId(sessionId: string): Promise<readonly import('../../src/app/quiz-attempt').QuizAttempt[]>;
    }
  >
>;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

async function main(): Promise<void> {
  const store: Array<import('../../src/app/quiz-session').QuizSession> = [];
  const attempts: Array<import('../../src/app/quiz-attempt').QuizAttempt> = [];

  const port: QuizPersistencePort = {
    async saveSession(session) {
      store.push(session);
    },
    async listSessions() {
      return [...store];
    },
    async getSessionById(id) {
      return store.find((session) => session.id === id) ?? null;
    },
    async saveAttempt(attempt) {
      attempts.push(attempt);
    },
    async listAttemptsBySessionId(sessionId) {
      return attempts.filter((attempt) => attempt.sessionId === sessionId);
    },
  };

  const firstSession = createQuizSession('Biology', [
    {
      question: 'Which part of a plant absorbs water?',
      options: ['Root', 'Leaf', 'Flower', 'Stem'] as const,
      correctAnswer: 0,
      explanation: 'Roots absorb water from the soil.',
    },
  ] as const, {
    idFactory: () => 'session-100',
    clock: () => new Date('2026-04-15T08:00:00.000Z'),
  });

  const secondSession = createQuizSession('Chemistry', [
    {
      question: 'What is the chemical symbol for water?',
      options: ['H2O', 'CO2', 'O2', 'NaCl'] as const,
      correctAnswer: 0,
      explanation: 'H2O is the chemical formula for water.',
    },
  ] as const, {
    idFactory: () => 'session-101',
    clock: () => new Date('2026-04-15T09:00:00.000Z'),
  });

  await port.saveSession(firstSession);
  await port.saveSession(secondSession);

  const firstAttempt = createQuizAttempt(
    'session-100',
    [0],
    scoreQuizAnswers(firstSession.questions, [0]),
    {
      idFactory: () => 'attempt-100',
      clock: () => new Date('2026-04-15T08:30:00.000Z'),
    },
  );

  await port.saveAttempt(firstAttempt);

  assertDeepEqual(
    await port.listSessions(),
    [firstSession, secondSession],
    'lists stored quiz sessions in insertion order',
  );

  assertDeepEqual(
    await port.getSessionById('session-101'),
    secondSession,
    'retrieves a stored quiz session by id',
  );

  assertDeepEqual(
    await port.getSessionById('missing-session'),
    null,
    'returns null when a stored quiz session does not exist',
  );

  assertDeepEqual(
    await port.listAttemptsBySessionId('session-100'),
    [firstAttempt],
    'lists stored quiz attempts by session id',
  );
}

void main().catch((error) => {
  throw error;
});
