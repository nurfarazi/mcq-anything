import type {
  MCQ,
  MCQCorrectAnswerIndex,
  MCQGenerationRequest,
  MCQGenerationResponse,
} from '../../src/llm/types';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type RequestShape = Expect<
  Equal<MCQGenerationRequest, { topic: string; questionCount: number }>
>;

type ResponseShape = Expect<
  Equal<MCQGenerationResponse, { questions: readonly MCQ[] }>
>;

type CorrectAnswerShape = Expect<Equal<MCQCorrectAnswerIndex, 0 | 1 | 2 | 3>>;
type MCQOptionsShape = Expect<
  Equal<MCQ['options'], readonly [string, string, string, string]>
>;

const validMcq = {
  question: 'What is the capital of France?',
  options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
  correctAnswer: 2,
  explanation: 'Paris is the capital city of France.',
} satisfies MCQ;

const validResponse = {
  questions: [validMcq],
} satisfies MCQGenerationResponse;

void validResponse;

const invalidMcqTooFewOptions = {
  question: 'Which is a prime number?',
  // @ts-expect-error - the contract requires exactly four options.
  options: ['2', '3', '4'] as const,
  correctAnswer: 0,
  explanation: '2 and 3 are prime, but the shape must still have four options.',
} satisfies MCQ;

const invalidMcqBadAnswer = {
  question: 'Which planet is known as the Red Planet?',
  options: ['Earth', 'Mars', 'Venus', 'Jupiter'] as const,
  // @ts-expect-error - correctAnswer must be one of the four tuple indexes.
  correctAnswer: 4,
  explanation: 'Mars is the Red Planet.',
} satisfies MCQ;
