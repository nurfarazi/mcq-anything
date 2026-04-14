import { generateQuiz } from './quiz-generation';
import { createQuizSession, type QuizSession } from './quiz-session';
import type { QuizPersistencePort } from './quiz-store';
import type { AppError, QuizGenerationInput, QuizGenerationResult } from './quiz-types';

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
): Promise<QuizGenerationResult> {
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

  return generationResult;
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
