import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  generateAndStoreQuiz,
  getQuizSession,
  listPastQuizzes,
} from './app/quiz-lifecycle';
import { generateQuiz } from './app/quiz-generation';
import { renderQuizResult } from './ui/quiz-page-render';
import { FileQuizPersistenceAdapter } from './app/quiz-store-file';
import type { QuizGenerationInput, QuizGenerationResult } from './app/quiz-types';
import type { QuizSession } from './app/quiz-session';

export type CliCommand =
  | {
      kind: 'generate';
      input: QuizGenerationInput;
      storePath: string | null;
    }
  | {
      kind: 'history';
      storePath: string;
    }
  | {
      kind: 'show';
      id: string;
      storePath: string;
    }
  | {
      kind: 'help';
    };

export interface ParsedCliArgs {
  command: CliCommand;
}

const DEFAULT_STORE_PATH = resolve(process.cwd(), '.mcq-anything', 'sessions.json');

function parsePositiveInteger(value: string): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid question count: ${value}`);
  }

  return parsed;
}

function takeOptionValue(args: string[], index: number, name: string): [string, number] {
  const value = args[index + 1];

  if (value === undefined || value.startsWith('--')) {
    throw new Error(`Missing value for ${name}`);
  }

  return [value, index + 1];
}

function resolveStorePath(storePath: string | null | undefined): string {
  return resolve(storePath ?? DEFAULT_STORE_PATH);
}

export function parseCliArgs(argv: readonly string[]): ParsedCliArgs {
  const args = [...argv];

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { command: { kind: 'help' } };
  }

  const commandName = args[0] ?? 'generate';
  const remaining = commandName === 'generate' || commandName === 'history' || commandName === 'show'
    ? args.slice(1)
    : args;

  if (commandName === 'history') {
    let storePath: string | null = null;

    for (let i = 0; i < remaining.length; i += 1) {
      const token = remaining[i];

      if (token === '--store') {
        [storePath, i] = takeOptionValue(remaining, i, '--store');
      } else if (token?.startsWith('--store=')) {
        storePath = token.slice('--store='.length);
      }
    }

    return {
      command: {
        kind: 'history',
        storePath: resolveStorePath(storePath),
      },
    };
  }

  if (commandName === 'show') {
    const [id, ...rest] = remaining;

    if (!id) {
      throw new Error('Missing session id for show command');
    }

    let storePath: string | null = null;

    for (let i = 0; i < rest.length; i += 1) {
      const token = rest[i];

      if (token === '--store') {
        [storePath, i] = takeOptionValue(rest, i, '--store');
      } else if (token?.startsWith('--store=')) {
        storePath = token.slice('--store='.length);
      }
    }

    return {
      command: {
        kind: 'show',
        id,
        storePath: resolveStorePath(storePath),
      },
    };
  }

  const generateArgs = commandName === 'generate' ? remaining : args;
  const [topic, countText, ...rest] = generateArgs;

  if (!topic || !countText) {
    return { command: { kind: 'help' } };
  }

  let storePath: string | null = null;
  let shouldStore = true;

  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];

    if (token === '--store') {
      [storePath, i] = takeOptionValue(rest, i, '--store');
      shouldStore = true;
    } else if (token?.startsWith('--store=')) {
      storePath = token.slice('--store='.length);
      shouldStore = true;
    } else if (token === '--no-store') {
      shouldStore = false;
      storePath = null;
    }
  }

  return {
    command: {
      kind: 'generate',
      input: {
        topic,
        questionCount: parsePositiveInteger(countText),
      },
      storePath: shouldStore ? resolveStorePath(storePath) : null,
    },
  };
}

function createPersistenceStore(storePath: string): FileQuizPersistenceAdapter {
  return new FileQuizPersistenceAdapter(storePath);
}

function renderHelp(): string {
  return [
    'MCQ Anything',
    '',
    'Usage:',
    '  mcq-anything <topic> <questionCount> [--store <path>] [--no-store]',
    '  mcq-anything history [--store <path>]',
    '  mcq-anything show <sessionId> [--store <path>]',
    '',
    'Examples:',
    '  mcq-anything Astronomy 2',
    '  mcq-anything history',
    '  mcq-anything show session-001',
  ].join('\n');
}

function renderStoredSession(session: QuizSession): string {
  const quizOutput = renderQuizResult({
    ok: true,
    value: {
      questions: session.questions,
    },
  });

  return [
    `Quiz session: ${session.id}`,
    `Topic: ${session.topic}`,
    `Created at: ${session.createdAt}`,
    '',
    quizOutput,
  ].join('\n');
}

function renderHistory(sessions: readonly QuizSession[]): string {
  if (sessions.length === 0) {
    return 'No stored quiz sessions found.';
  }

  return [
    'Stored quiz sessions',
    '',
    ...sessions.map((session, index) => {
      const questionCount = session.questions.length;

      return [
        `${index + 1}. ${session.topic} (${questionCount} questions)`,
        `   id: ${session.id}`,
        `   createdAt: ${session.createdAt}`,
      ].join('\n');
    }),
  ].join('\n\n');
}

async function handleGenerate(input: QuizGenerationInput, storePath: string | null): Promise<void> {
  const result: QuizGenerationResult = storePath
    ? await generateAndStoreQuiz(input, createPersistenceStore(storePath))
    : await generateQuiz(input);

  const output = renderQuizResult(result);

  if (result.ok) {
    console.log(output);
    return;
  }

  console.error(output);
  process.exitCode = 1;
}

async function handleHistory(storePath: string): Promise<void> {
  const result = await listPastQuizzes(createPersistenceStore(storePath));

  if (!result.ok) {
    console.error('Error: GENERATION_FAILED');
    console.error(`Message: ${result.error.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(renderHistory(result.value));
}

async function handleShow(id: string, storePath: string): Promise<void> {
  const result = await getQuizSession(id, createPersistenceStore(storePath));

  if (!result.ok) {
    console.error('Error: GENERATION_FAILED');
    console.error(`Message: ${result.error.message}`);
    process.exitCode = 1;
    return;
  }

  if (result.value === null) {
    console.error(`Quiz session not found: ${id}`);
    process.exitCode = 1;
    return;
  }

  console.log(renderStoredSession(result.value));
}

export async function main(argv = process.argv.slice(2)): Promise<void> {
  let parsed: ParsedCliArgs;

  try {
    parsed = parseCliArgs(argv);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  switch (parsed.command.kind) {
    case 'help':
      console.log(renderHelp());
      return;
    case 'generate':
      await handleGenerate(parsed.command.input, parsed.command.storePath);
      return;
    case 'history':
      await handleHistory(parsed.command.storePath);
      return;
    case 'show':
      await handleShow(parsed.command.id, parsed.command.storePath);
      return;
  }
}

const executedDirectly = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (executedDirectly) {
  void main();
}
