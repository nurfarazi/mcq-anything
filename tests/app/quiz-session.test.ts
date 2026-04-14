import { createQuizSession, type QuizSession } from '../../src/app/quiz-session';
import type { MCQGenerationResponse } from '../../src/llm';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type SessionShape = Expect<
  Equal<
    QuizSession,
    {
      id: string;
      topic: string;
      questions: MCQGenerationResponse['questions'];
      createdAt: string;
    }
  >
>;

function assertEqual(actual: unknown, expected: unknown, label: string): void {
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

const questions = [
  {
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
    correctAnswer: 2,
    explanation: 'Paris is the capital city of France.',
  },
] as const;

const firstSession = createQuizSession('Geography', questions, {
  idFactory: () => 'session-001',
  clock: () => new Date('2026-04-15T12:34:56.000Z'),
});

assertEqual(
  firstSession,
  {
    id: 'session-001',
    topic: 'Geography',
    questions,
    createdAt: '2026-04-15T12:34:56.000Z',
  },
  'creates a persisted quiz session snapshot with the expected shape',
);

const generatedSessionA = createQuizSession('Geography', questions, {
  clock: () => new Date('2026-04-15T12:34:56.000Z'),
});

const generatedSessionB = createQuizSession('Geography', questions, {
  clock: () => new Date('2026-04-15T12:34:56.000Z'),
});

assertTrue(
  generatedSessionA.id !== generatedSessionB.id,
  'generates distinct ids when the default session id generator is used repeatedly',
);

assertTrue(
  firstSession.createdAt === '2026-04-15T12:34:56.000Z',
  'serializes the timestamp as an ISO string',
);
