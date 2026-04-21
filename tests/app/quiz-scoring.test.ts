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
    question: 'Which planet is closest to the Sun?',
    options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
    correctAnswer: 0 as const,
    explanation: 'Mercury is the closest planet to the Sun.',
  },
  {
    question: 'Which planet is known as the Red Planet?',
    options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
    correctAnswer: 3 as const,
    explanation: 'Mars is often called the Red Planet because of its iron oxide surface.',
  },
] as const;

const score = scoreQuizAnswers(questions, [0, 1]);

assertDeepEqual(
  score.score,
  {
    correctCount: 1,
    totalQuestions: 2,
    percentage: 50,
  },
  'summarizes the correct answer count and percentage for a submission',
);

assertDeepEqual(
  score.questions,
  [
    {
      questionIndex: 0,
      question: 'Which planet is closest to the Sun?',
      options: ['Mercury', 'Venus', 'Earth', 'Mars'],
      selectedAnswer: 0,
      correctAnswer: 0,
      isCorrect: true,
      explanation: 'Mercury is the closest planet to the Sun.',
    },
    {
      questionIndex: 1,
      question: 'Which planet is known as the Red Planet?',
      options: ['Mercury', 'Venus', 'Earth', 'Mars'],
      selectedAnswer: 1,
      correctAnswer: 3,
      isCorrect: false,
      explanation: 'Mars is often called the Red Planet because of its iron oxide surface.',
    },
  ],
  'returns detailed per-question feedback for quiz submissions',
);