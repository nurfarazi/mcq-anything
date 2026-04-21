import { toQuizPageErrorViewModel, toQuizPageViewModel } from '../../src/ui/quiz-page-render';

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

const session = {
  id: 'session-123',
  topic: 'Astronomy',
  createdAt: '2026-04-22T08:00:00.000Z',
  questions: [
    {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
      correctAnswer: 2,
      explanation: 'Paris is the capital city of France.',
    },
    {
      question: 'Which planet is known as the Red Planet?',
      options: ['Earth', 'Mars', 'Venus', 'Jupiter'] as const,
      correctAnswer: 1,
      explanation: 'Mars is called the Red Planet.',
    },
  ],
} as const;

const errorResult = {
  ok: false,
  error: {
    code: 'INVALID_MODEL_OUTPUT' as const,
    message: 'Returned question count did not match the request.',
  },
} as const;

const successViewModel = toQuizPageViewModel(session);
assertEqual(
  successViewModel,
  {
    kind: 'success',
    sessionId: 'session-123',
    topic: 'Astronomy',
    attemptEndpoint: '/quizzes/session-123/attempts',
    initialProgressLabel: 'Question 1 of 2',
    questions: [
      {
        question: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Venus', 'Jupiter'],
      },
    ],
  },
  'maps a stored quiz session into a browser-play view model without leaking answers',
);

const errorViewModel = toQuizPageErrorViewModel(errorResult.error);
assertEqual(
  errorViewModel,
  {
    kind: 'error',
    error: {
      code: 'INVALID_MODEL_OUTPUT',
      message: 'Returned question count did not match the request.',
    },
  },
  'maps an app-safe error into a renderable error view model',
);
