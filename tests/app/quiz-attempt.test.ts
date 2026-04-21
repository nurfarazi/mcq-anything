import { createQuizAttempt } from '../../src/app/quiz-attempt';
import { scoreQuizAnswers } from '../../src/app/quiz-scoring';

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

const questions = [
  {
    question: 'Which ocean is the largest?',
    options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'] as const,
    correctAnswer: 1 as const,
    explanation: 'The Pacific Ocean is the largest ocean on Earth.',
  },
] as const;

const scoredAttempt = scoreQuizAnswers(questions, [1]);

const attempt = createQuizAttempt('session-123', [1], scoredAttempt, {
  idFactory: () => 'attempt-123',
  clock: () => new Date('2026-04-22T10:15:00.000Z'),
});

assertDeepEqual(
  attempt,
  {
    id: 'attempt-123',
    sessionId: 'session-123',
    answers: [1],
    submittedAt: '2026-04-22T10:15:00.000Z',
    score: {
      correctCount: 1,
      totalQuestions: 1,
      percentage: 100,
    },
    questions: [
      {
        questionIndex: 0,
        question: 'Which ocean is the largest?',
        options: ['Atlantic', 'Pacific', 'Indian', 'Arctic'],
        selectedAnswer: 1,
        correctAnswer: 1,
        isCorrect: true,
        explanation: 'The Pacific Ocean is the largest ocean on Earth.',
      },
    ],
  },
  'creates a persisted attempt record with score details and metadata',
);