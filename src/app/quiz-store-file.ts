declare const require: {
  (id: string): unknown;
};

const { mkdir, readFile, rename, rm, writeFile } = require('fs/promises') as {
  mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  readFile(path: string, encoding: 'utf8'): Promise<string>;
  rename(oldPath: string, newPath: string): Promise<void>;
  rm(path: string, options?: { force?: boolean }): Promise<void>;
  writeFile(path: string, data: string, encoding: 'utf8'): Promise<void>;
};

const { dirname } = require('path') as {
  dirname(path: string): string;
};
import type { QuizPersistencePort } from './quiz-store';
import type { QuizSession } from './quiz-session';

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

async function readSessionsFromFile(filePath: string): Promise<QuizSession[]> {
  try {
    const raw = await readFile(filePath, 'utf8');

    if (raw.trim().length === 0) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;

    if (parsed === null) {
      throw safeStorageError('Unable to read quiz sessions from storage.');
    }

    if (!isQuizSessionArray(parsed)) {
      throw safeStorageError('Unable to read quiz sessions from storage.');
    }

    return parsed;
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
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

async function writeSessionsToFile(filePath: string, sessions: readonly QuizSession[]): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });

  const processLike = globalThis as {
    process?: { pid?: number };
  };

  const tempPath = `${filePath}.tmp-${processLike.process?.pid ?? 'pid'}-${Date.now()}`;
  const serialized = JSON.stringify(sessions, null, 2);

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
    const sessions = await readSessionsFromFile(this.filePath);
    const nextSessions = [session, ...sessions.filter((existing) => existing.id !== session.id)];

    await writeSessionsToFile(this.filePath, nextSessions);
  }

  async listSessions(): Promise<readonly QuizSession[]> {
    const sessions = await readSessionsFromFile(this.filePath);
    return sessions;
  }

  async getSessionById(id: string): Promise<QuizSession | null> {
    const sessions = await readSessionsFromFile(this.filePath);
    return sessions.find((session) => session.id === id) ?? null;
  }
}
