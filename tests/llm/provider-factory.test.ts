import type { McqProvider, ProviderFactoryOptions } from '../../src/llm/provider-factory';
import { createProvider } from '../../src/llm/provider-factory';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type ProviderReturnShape = Expect<Equal<McqProvider, { generate(request: import('../../src/llm/types').MCQGenerationRequest): Promise<import('../../src/llm/types').MCQGenerationResponse> }>>;
type OptionsShape = Expect<Equal<ProviderFactoryOptions, { lmStudio: import('../../src/llm/providers/lm-studio').LmStudioTransportOptions }>>;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertThrows(fn: () => unknown, messagePart: string, label: string): void {
  try {
    fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes(messagePart)) {
      throw new Error(`${label}: expected error message to include ${messagePart}, received ${message}`);
    }

    return;
  }

  throw new Error(`${label}: expected function to throw`);
}

async function main(): Promise<void> {
  const observedCalls: Array<{
    input: string;
    body: string;
  }> = [];

  const fetchImpl = async (input: string, init: { method: string; headers: Record<string, string>; body: string }) => {
    observedCalls.push({ input, body: init.body });

    return {
      ok: true,
      status: 200,
      async json() {
        return {
          questions: [
            {
              question_text: 'What is 2 + 2?',
              options: ['1', '2', '3', '4'] as const,
              correct_answer: 3,
              explanation_text: '2 + 2 equals 4.',
            },
          ],
        };
      },
    };
  };

  const options: ProviderFactoryOptions = {
    lmStudio: {
      endpoint: 'http://127.0.0.1:1234/v1/mcq',
      fetchImpl,
    },
  };

  const provider = createProvider('lm-studio', options);
  const result = await provider.generate({ topic: 'Math', questionCount: 1 });

  assertDeepEqual(
    observedCalls,
    [
      {
        input: 'http://127.0.0.1:1234/v1/mcq',
        body: JSON.stringify({ topic: 'Math', question_count: 1 }),
      },
    ],
    'uses the LM Studio adapter to generate the request payload',
  );

  assertDeepEqual(
    result,
    {
      questions: [
        {
          question: 'What is 2 + 2?',
          options: ['1', '2', '3', '4'],
          correctAnswer: 3,
          explanation: '2 + 2 equals 4.',
        },
      ],
    },
    'returns the normalized response from the LM Studio adapter',
  );

}

void main().catch((error) => {
  throw error;
});