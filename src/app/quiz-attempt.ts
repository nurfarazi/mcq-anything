import type { QuizAttemptEvaluation } from './quiz-scoring';

export type QuizAnswerValue = 0 | 1 | 2 | 3;

export interface QuizAttemptScore {
  correctCount: number;
  totalQuestions: number;
  percentage: number;
}

export interface QuizAttemptQuestionResult {
  questionIndex: number;
  question: string;
  options: readonly [string, string, string, string];
  selectedAnswer: QuizAnswerValue;
  correctAnswer: QuizAnswerValue;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizAttempt {
  id: string;
  sessionId: string;
  answers: readonly QuizAnswerValue[];
  submittedAt: string;
  score: QuizAttemptScore;
  questions: readonly QuizAttemptQuestionResult[];
}

export interface CreateQuizAttemptOptions {
  idFactory?: () => string;
  clock?: () => Date;
}

let fallbackAttemptCounter = 0;

function generateQuizAttemptId(): string {
  const cryptoLike = globalThis as {
    crypto?: { randomUUID?: () => string };
  };

  const randomUuid = cryptoLike.crypto?.randomUUID?.();

  if (typeof randomUuid === 'string' && randomUuid.trim().length > 0) {
    return randomUuid;
  }

  fallbackAttemptCounter += 1;
  const timestamp = Date.now().toString(36);
  const counter = fallbackAttemptCounter.toString(36);

  return `attempt-${timestamp}-${counter}`;
}

function toIsoTimestamp(value: Date): string {
  return value.toISOString();
}

export function createQuizAttempt(
  sessionId: string,
  answers: readonly QuizAnswerValue[],
  evaluation: QuizAttemptEvaluation,
  options: CreateQuizAttemptOptions = {},
): QuizAttempt {
  return {
    id: options.idFactory?.() ?? generateQuizAttemptId(),
    sessionId,
    answers: [...answers],
    submittedAt: toIsoTimestamp(options.clock?.() ?? new Date()),
    score: evaluation.score,
    questions: evaluation.questions,
  };
}