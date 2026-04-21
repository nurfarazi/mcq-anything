import { resolve } from 'node:path';
import { parseCliArgs } from '../src/cli';

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

assertDeepEqual(
  parseCliArgs(['Astronomy', '2']),
  {
    command: {
      kind: 'generate',
      input: { topic: 'Astronomy', questionCount: 2 },
      storePath: resolve(process.cwd(), '.mcq-anything', 'sessions.json'),
    },
  },
  'parses the default generate command',
);

assertDeepEqual(
  parseCliArgs(['history', '--store', 'quiz-store.json']),
  {
    command: {
      kind: 'history',
      storePath: resolve(process.cwd(), 'quiz-store.json'),
    },
  },
  'parses the history command with a custom store',
);
