import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createQuizAttempt } from '../../src/app/quiz-attempt';
import { scoreQuizAnswers } from '../../src/app/quiz-scoring';
import { FileQuizPersistenceAdapter } from '../../src/app/quiz-store-file';
import { createQuizSession } from '../../src/app/quiz-session';

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertTrue(value: unknown, label: string): void {
  if (value !== true) {
    throw new Error(`${label}: expected true`);
  }
}

async function expectRejectsWithMessage(
  fn: () => Promise<unknown>,
  messagePart: string,
  label: string,
): Promise<void> {
  try {
    await fn();
    throw new Error(`${label}: expected function to reject`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes(messagePart)) {
      throw new Error(`${label}: expected error message to include ${messagePart}, received ${message}`);
    }
  }
}

async function createTempFilePath(): Promise<{ dirPath: string; filePath: string }> {
  const dirPath = await mkdtemp(join(tmpdir(), 'mcq-anything-store-'));
  return {
    dirPath,
    filePath: join(dirPath, 'sessions.json'),
  };
}

async function main(): Promise<void> {
  const { dirPath, filePath } = await createTempFilePath();
  const store = new FileQuizPersistenceAdapter(filePath);

  const firstSession = createQuizSession('Geography', [
    {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
      correctAnswer: 2,
      explanation: 'Paris is the capital city of France.',
    },
  ] as const, {
    idFactory: () => 'session-001',
    clock: () => new Date('2026-04-15T10:00:00.000Z'),
  });

  await store.saveSession(firstSession);

  assertTrue(await readFile(filePath, 'utf8').then((text) => text.length > 0), 'saving creates the JSON file');

  assertDeepEqual(
    JSON.parse(await readFile(filePath, 'utf8')),
    {
      sessions: [firstSession],
      attempts: [],
    },
    'saveSession persists the first quiz session in the structured storage envelope',
  );

  const secondSession = createQuizSession('Physics', [
    {
      question: 'What is the SI unit of force?',
      options: ['Newton', 'Joule', 'Watt', 'Pascal'] as const,
      correctAnswer: 0,
      explanation: 'A newton is the SI unit of force.',
    },
  ] as const, {
    idFactory: () => 'session-002',
    clock: () => new Date('2026-04-15T11:00:00.000Z'),
  });

  await store.saveSession(secondSession);

  assertDeepEqual(
    await store.listSessions(),
    [secondSession, firstSession],
    'multiple saves accumulate sessions with the most recent first when listed',
  );

  assertDeepEqual(
    await store.getSessionById('session-001'),
    firstSession,
    'getSessionById returns the matching stored session',
  );

  const firstAttempt = createQuizAttempt(
    'session-001',
    [2],
    scoreQuizAnswers(firstSession.questions, [2]),
    {
      idFactory: () => 'attempt-001',
      clock: () => new Date('2026-04-15T10:30:00.000Z'),
    },
  );

  await store.saveAttempt(firstAttempt);

  assertDeepEqual(
    await store.listAttemptsBySessionId('session-001'),
    [firstAttempt],
    'saveAttempt persists a scored attempt and lists it by session id',
  );

  const secondAttempt = createQuizAttempt(
    'session-001',
    [1],
    scoreQuizAnswers(firstSession.questions, [1]),
    {
      idFactory: () => 'attempt-002',
      clock: () => new Date('2026-04-15T10:45:00.000Z'),
    },
  );

  await store.saveAttempt(secondAttempt);

  assertDeepEqual(
    await store.listAttemptsBySessionId('session-001'),
    [secondAttempt, firstAttempt],
    'multiple attempts are listed most-recent first for the same session',
  );

  const updatedFirstSession = createQuizSession('Geography', [
    {
      question: 'What is the capital of France?',
      options: ['Berlin', 'Madrid', 'Paris', 'Rome'] as const,
      correctAnswer: 2,
      explanation: 'Paris is the capital city of France.',
    },
  ] as const, {
    idFactory: () => 'session-001',
    clock: () => new Date('2026-04-15T12:00:00.000Z'),
  });

  await store.saveSession(updatedFirstSession);

  assertDeepEqual(
    await store.listSessions(),
    [updatedFirstSession, secondSession],
    'saving the same id updates the existing record instead of duplicating it',
  );

  const missingDir = await mkdtemp(join(tmpdir(), 'mcq-anything-missing-'));
  const missingFileStore = new FileQuizPersistenceAdapter(join(missingDir, 'missing.json'));

  assertDeepEqual(
    await missingFileStore.listSessions(),
    [],
    'missing files are treated as an empty store',
  );

  assertDeepEqual(
    await missingFileStore.getSessionById('missing'),
    null,
    'missing files still allow safe get-by-id lookups',
  );

  assertDeepEqual(
    await missingFileStore.listAttemptsBySessionId('missing'),
    [],
    'missing files treat saved attempts as an empty collection',
  );

  const legacyFilePath = join(dirPath, 'legacy.json');
  await writeFile(legacyFilePath, JSON.stringify([firstSession], null, 2), 'utf8');
  const legacyStore = new FileQuizPersistenceAdapter(legacyFilePath);

  assertDeepEqual(
    await legacyStore.listSessions(),
    [firstSession],
    'legacy array-only session files are still readable after the storage format upgrade',
  );

  assertDeepEqual(
    await legacyStore.listAttemptsBySessionId('session-001'),
    [],
    'legacy array-only session files default to zero saved attempts',
  );

  const corruptedFilePath = join(dirPath, 'corrupted.json');
  await writeFile(corruptedFilePath, '{not-json', 'utf8');
  const corruptedStore = new FileQuizPersistenceAdapter(corruptedFilePath);

  await expectRejectsWithMessage(
    () => corruptedStore.listSessions(),
    'Unable to read quiz sessions from storage.',
    'corrupted files surface an app-safe read failure',
  );

  await expectRejectsWithMessage(
    () => corruptedStore.getSessionById('session-001'),
    'Unable to read quiz sessions from storage.',
    'corrupted files surface an app-safe get failure',
  );

  await expectRejectsWithMessage(
    () => corruptedStore.listAttemptsBySessionId('session-001'),
    'Unable to read quiz sessions from storage.',
    'corrupted files surface an app-safe attempt-list failure',
  );

  await rm(dirPath, { recursive: true, force: true });
  await rm(missingDir, { recursive: true, force: true });
}

void main().catch((error) => {
  throw error;
});
