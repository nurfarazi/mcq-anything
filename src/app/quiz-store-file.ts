import { dirname } from 'node:path';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import type { QuizAttempt } from './quiz-attempt';
import type { QuizPersistencePort } from './quiz-store';
import type { QuizSession } from './quiz-session';

interface StoredQuizData {
  sessions: QuizSession[];
  attempts: QuizAttempt[];
}

function safeStorageError(message: string): Error {
  return new Error(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isQuizSession(value: unknown): value is QuizSession {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.topic === 'string' &&
    value.topic.trim().length > 0 &&
    typeof value.createdAt === 'string' &&
    value.createdAt.trim().length > 0 &&
    Array.isArray(value.questions)
  );
}

function isQuizSessionArray(value: unknown): value is QuizSession[] {
  return Array.isArray(value) && value.every(isQuizSession);
}

function isQuizAttempt(value: unknown): value is QuizAttempt {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    value.id.trim().length > 0 &&
    typeof value.sessionId === 'string' &&
    value.sessionId.trim().length > 0 &&
    typeof value.submittedAt === 'string' &&
    value.submittedAt.trim().length > 0 &&
    isRecord(value.score) &&
    typeof value.score.correctCount === 'number' &&
    typeof value.score.totalQuestions === 'number' &&
    typeof value.score.percentage === 'number' &&
    Array.isArray(value.answers) &&
    value.answers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 3) &&
    Array.isArray(value.questions)
  );
}

function isQuizAttemptArray(value: unknown): value is QuizAttempt[] {
  return Array.isArray(value) && value.every(isQuizAttempt);
}

function isStoredQuizData(value: unknown): value is StoredQuizData {
  if (!isRecord(value)) {
    return false;
  }

  return isQuizSessionArray(value.sessions) && isQuizAttemptArray(value.attempts);
}

async function readQuizDataFromFile(filePath: string): Promise<StoredQuizData> {
  try {
    const raw = await readFile(filePath, 'utf8');

    if (raw.trim().length === 0) {
      return {
        sessions: [],
        attempts: [],
      };
    }

    const parsed = JSON.parse(raw) as unknown;

    if (parsed === null) {
      throw safeStorageError('Unable to read quiz sessions from storage.');
    }

    if (isQuizSessionArray(parsed)) {
      return {
        sessions: parsed,
        attempts: [],
      };
    }

    if (!isStoredQuizData(parsed)) {
      throw safeStorageError('Unable to read quiz sessions from storage.');
    }

    return parsed;
  } catch (error) {
    if (isMissingFileError(error)) {
      return {
        sessions: [],
        attempts: [],
      };
    }

    if (error instanceof SyntaxError) {
      throw safeStorageError('Unable to read quiz sessions from storage.');
    }

    if (error instanceof Error && error.message === 'Unable to read quiz sessions from storage.') {
      throw error;
    }

    throw safeStorageError('Unable to read quiz sessions from storage.');
  }
}

function isMissingFileError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  const code = error.code;

  if (typeof code !== 'string') {
    return false;
  }

  return code === 'ENOENT';
}

async function writeQuizDataToFile(filePath: string, data: StoredQuizData): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });

  const processLike = globalThis as {
    process?: { pid?: number };
  };

  const tempPath = `${filePath}.tmp-${processLike.process?.pid ?? 'pid'}-${Date.now()}`;
  const serialized = JSON.stringify(data, null, 2);

  await writeFile(tempPath, serialized, 'utf8');

  try {
    await rm(filePath, { force: true });
    await rename(tempPath, filePath);
  } catch (error) {
    try {
      await rm(tempPath, { force: true });
    } catch {
      // Ignore cleanup errors.
    }

    if (error instanceof Error) {
      throw safeStorageError('Unable to write quiz sessions to storage.');
    }

    throw safeStorageError('Unable to write quiz sessions to storage.');
  }
}

export class FileQuizPersistenceAdapter implements QuizPersistencePort {
  constructor(private readonly filePath: string) {}

  async saveSession(session: QuizSession): Promise<void> {
    const data = await readQuizDataFromFile(this.filePath);
    const nextSessions = [session, ...data.sessions.filter((existing) => existing.id !== session.id)];

    await writeQuizDataToFile(this.filePath, {
      sessions: nextSessions,
      attempts: data.attempts,
    });
  }

  async listSessions(): Promise<readonly QuizSession[]> {
    const data = await readQuizDataFromFile(this.filePath);
    return data.sessions;
  }

  async getSessionById(id: string): Promise<QuizSession | null> {
    const data = await readQuizDataFromFile(this.filePath);
    return data.sessions.find((session) => session.id === id) ?? null;
  }

  async saveAttempt(attempt: QuizAttempt): Promise<void> {
    const data = await readQuizDataFromFile(this.filePath);
    const nextAttempts = [attempt, ...data.attempts.filter((existing) => existing.id !== attempt.id)];

    await writeQuizDataToFile(this.filePath, {
      sessions: data.sessions,
      attempts: nextAttempts,
    });
  }

  async listAttemptsBySessionId(sessionId: string): Promise<readonly QuizAttempt[]> {
    const data = await readQuizDataFromFile(this.filePath);
    return data.attempts.filter((attempt) => attempt.sessionId === sessionId);
  }
}
