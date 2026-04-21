import { generateQuiz } from './quiz-generation';
import { createQuizAttempt, type QuizAnswerValue, type QuizAttempt } from './quiz-attempt';
import { scoreQuizAnswers } from './quiz-scoring';
import { createQuizSession, type QuizSession } from './quiz-session';
import type { QuizPersistencePort } from './quiz-store';
import type { AppError, QuizGenerationInput } from './quiz-types';

export interface QuizLifecycleSuccess<T> {
  ok: true;
  value: T;
}

export interface QuizLifecycleFailure {
  ok: false;
  error: AppError;
}

export type QuizLifecycleResult<T> = QuizLifecycleSuccess<T> | QuizLifecycleFailure;

function storageFailure(message: string): QuizLifecycleFailure {
  return {
    ok: false,
    error: {
      code: 'GENERATION_FAILED',
      message,
    },
  };
}

export async function generateAndStoreQuiz(
  input: QuizGenerationInput,
  store: QuizPersistencePort,
): Promise<QuizLifecycleResult<QuizSession>> {
  const generationResult = await generateQuiz(input);

  if (!generationResult.ok) {
    return generationResult;
  }

  const session = createQuizSession(input.topic.trim(), generationResult.value.questions);

  try {
    await store.saveSession(session);
  } catch {
    return storageFailure('Unable to store quiz session.');
  }

  return {
    ok: true,
    value: session,
  };
}

function invalidInput(message: string): QuizLifecycleFailure {
  return {
    ok: false,
    error: {
      code: 'INVALID_INPUT',
      message,
    },
  };
}

function normalizeSubmittedAnswers(
  expectedQuestionCount: number,
  answers: readonly number[],
): QuizLifecycleFailure | readonly QuizAnswerValue[] {
  if (answers.length !== expectedQuestionCount) {
    return invalidInput('All questions must be answered before submitting the quiz.');
  }

  const normalizedAnswers: QuizAnswerValue[] = [];

  for (const answer of answers) {
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) {
      return invalidInput('Submitted answers must be integers between 0 and 3.');
    }

    normalizedAnswers.push(answer as QuizAnswerValue);
  }

  return normalizedAnswers;
}

export async function submitQuizAttempt(
  session: QuizSession,
  answers: readonly number[],
  store: QuizPersistencePort,
): Promise<QuizLifecycleResult<QuizAttempt>> {
  const normalizedAnswers = normalizeSubmittedAnswers(session.questions.length, answers);

  if (!Array.isArray(normalizedAnswers)) {
    return normalizedAnswers;
  }

  const attempt = createQuizAttempt(
    session.id,
    normalizedAnswers,
    scoreQuizAnswers(session.questions, normalizedAnswers),
  );

  try {
    await store.saveAttempt(attempt);
  } catch {
    return storageFailure('Unable to store quiz attempt.');
  }

  return {
    ok: true,
    value: attempt,
  };
}

export async function listPastQuizzes(
  store: QuizPersistencePort,
): Promise<QuizLifecycleResult<readonly QuizSession[]>> {
  try {
    return {
      ok: true,
      value: await store.listSessions(),
    };
  } catch {
    return storageFailure('Unable to load stored quiz sessions.');
  }
}

export async function getQuizSession(
  id: string,
  store: QuizPersistencePort,
): Promise<QuizLifecycleResult<QuizSession | null>> {
  try {
    return {
      ok: true,
      value: await store.getSessionById(id),
    };
  } catch {
    return storageFailure('Unable to load stored quiz session.');
  }
}
