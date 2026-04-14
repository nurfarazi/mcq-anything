import {
  areQuestionsNearDuplicate,
  findQuizQualityIssue,
  hasConsistentAnswerOptionRelationship,
  isExplanationWeak,
  isQuestionSufficientlyOnTopic,
  normalizeQuizText,
} from '../../src/app/quiz-quality';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type NormalizeShape = Expect<Equal<ReturnType<typeof normalizeQuizText>, string>>;

function assertTrue(value: unknown, label: string): void {
  if (value !== true) {
    throw new Error(`${label}: expected true`);
  }
}

function assertFalse(value: unknown, label: string): void {
  if (value !== false) {
    throw new Error(`${label}: expected false`);
  }
}

const astronomyQuestion = {
  question: 'Which planet is closest to the Sun?',
  options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
  correctAnswer: 0 as const,
  explanation: 'Mercury is the closest planet to the Sun in our solar system.',
};

const astronomyVariant = {
  question: 'What planet is nearest to the Sun?',
  options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
  correctAnswer: 0 as const,
  explanation: 'Mercury is the closest planet to the Sun in our solar system.',
};

assertTrue(
  areQuestionsNearDuplicate(astronomyQuestion.question, astronomyVariant.question),
  'detects near-duplicate quiz questions',
);

assertFalse(
  areQuestionsNearDuplicate(
    'What is the capital of France?',
    'Which planet is closest to the Sun?',
  ),
  'does not flag unrelated questions as near-duplicates',
);

assertTrue(
  isQuestionSufficientlyOnTopic(astronomyQuestion, 'Astronomy'),
  'accepts questions that are clearly on topic',
);

assertFalse(
  isQuestionSufficientlyOnTopic(
    {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
      correctAnswer: 2,
      explanation: 'Paris is the capital city of France.',
    },
    'Astronomy',
  ),
  'rejects questions that do not relate to the requested topic',
);

assertTrue(
  hasConsistentAnswerOptionRelationship(astronomyQuestion),
  'accepts a question with consistent answer and option relationships',
);

assertFalse(
  hasConsistentAnswerOptionRelationship({
    question: 'Which planet is closest to the Sun?',
    options: ['Mercury', 'Mercury', 'Earth', 'Mars'] as const,
    correctAnswer: 0,
    explanation: 'Mercury is closest.',
  }),
  'rejects questions with duplicate answer options',
);

assertTrue(isExplanationWeak('It is correct.'), 'flags weak explanations');
assertFalse(
  isExplanationWeak('Mercury is the closest planet to the Sun in our solar system.'),
  'accepts informative explanations',
);

assertTrue(
  normalizeQuizText('  Mercury, the closest planet!  ') === 'mercury the closest planet',
  'normalizes quiz text for similarity checks',
);

assertTrue(
  findQuizQualityIssue(
    {
      questions: [
        astronomyQuestion,
        {
          question: 'What planet is nearest to the Sun?',
          options: ['Mercury', 'Venus', 'Earth', 'Mars'] as const,
          correctAnswer: 0,
          explanation: 'Mercury is the closest planet to the Sun in our solar system.',
        },
      ],
    },
    'Astronomy',
  )?.code === 'DUPLICATE_OR_NEAR_DUPLICATE_QUESTION',
  'detects duplicate or near-duplicate questions in a quiz set',
);
