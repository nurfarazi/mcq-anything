import { renderQuizPage, renderQuizResult, toQuizPageViewModel } from '../../src/ui/quiz-page-render';

function assertEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

const successResult = {
  ok: true,
  value: {
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
  },
} as const;

const errorResult = {
  ok: false,
  error: {
    code: 'INVALID_MODEL_OUTPUT' as const,
    message: 'Returned question count did not match the request.',
  },
} as const;

const successViewModel = toQuizPageViewModel(successResult);
assertEqual(
  successViewModel,
  {
    kind: 'success',
    questions: [
      {
        question: 'What is the capital of France?',
        options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
        correctAnswer: 'C',
        explanation: 'Paris is the capital city of France.',
      },
      {
        question: 'Which planet is known as the Red Planet?',
        options: ['Earth', 'Mars', 'Venus', 'Jupiter'],
        correctAnswer: 'B',
        explanation: 'Mars is called the Red Planet.',
      },
    ],
  },
  'maps the public app success result into a renderable success view model',
);

assertEqual(
  renderQuizPage(successViewModel),
  [
    'Generated MCQs',
    '',
    '1. What is the capital of France?',
    '  A. Berlin',
    '  B. Madrid',
    '  C. Paris',
    '  D. Rome',
    '  Correct answer: C',
    '  Explanation: Paris is the capital city of France.',
    '',
    '2. Which planet is known as the Red Planet?',
    '  A. Earth',
    '  B. Mars',
    '  C. Venus',
    '  D. Jupiter',
    '  Correct answer: B',
    '  Explanation: Mars is called the Red Planet.',
  ].join('\n'),
  'renders questions, four options, correct answers, and explanations deterministically',
);

const errorViewModel = toQuizPageViewModel(errorResult);
assertEqual(
  errorViewModel,
  {
    kind: 'error',
    error: {
      code: 'INVALID_MODEL_OUTPUT',
      message: 'Returned question count did not match the request.',
    },
  },
  'maps the public app error result into a renderable error view model',
);

assertEqual(
  renderQuizPage(errorViewModel),
  [
    'Error: INVALID_MODEL_OUTPUT',
    'Message: Returned question count did not match the request.',
  ].join('\n'),
  'renders only app-safe error information',
);

assertEqual(
  renderQuizResult(successResult),
  renderQuizPage(successViewModel),
  'renders the same success output through the convenience helper',
);

assertEqual(
  renderQuizResult(errorResult),
  renderQuizPage(errorViewModel),
  'renders the same error output through the convenience helper',
);
