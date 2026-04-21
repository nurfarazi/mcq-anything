import type { MCQGenerationRequest, MCQGenerationResponse } from '../../src/llm/types';
import {
  requestMcqGenerationFromLmStudio,
  type LmStudioFetch,
  type LmStudioChatRequest,
  type LmStudioResponsePayload,
} from '../../src/llm/providers/lm-studio';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type ChatRequestShape = Expect<
  Equal<LmStudioChatRequest, { model: string; system_prompt: string; input: string }>
>;

type ResponsePayloadShape = Expect<
  Equal<
    LmStudioResponsePayload,
    {
      questions: readonly {
        question_text: string;
        options: readonly [string, string, string, string];
        correct_answer: 0 | 1 | 2 | 3;
        explanation_text: string;
      }[];
    }
  >
>;

type SharedRequestShape = Expect<
  Equal<MCQGenerationRequest, { topic: string; questionCount: number }>
>;

type SharedResponseShape = Expect<
  Equal<
    MCQGenerationResponse,
    {
      questions: readonly {
        question: string;
        options: readonly [string, string, string, string];
        correctAnswer: 0 | 1 | 2 | 3;
        explanation: string;
      }[];
    }
  >
>;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

function assertRejectsWithMessage(
  fn: () => Promise<unknown>,
  messagePart: string,
  label: string,
): Promise<void> {
  return fn()
    .then(() => {
      throw new Error(`${label}: expected function to reject`);
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);

      if (!message.includes(messagePart)) {
        throw new Error(`${label}: expected error message to include ${messagePart}, received ${message}`);
      }
    });
}

async function main(): Promise<void> {
  const sharedRequest: MCQGenerationRequest = {
    topic: 'Astronomy',
    questionCount: 2,
  };

  const observedCalls: Array<{
    input: string;
    init: Parameters<LmStudioFetch>[1];
  }> = [];

  const quizPayload: LmStudioResponsePayload = {
    questions: [
      {
        question_text: 'What is the closest planet to the Sun?',
        options: ['Mercury', 'Venus', 'Earth', 'Mars'],
        correct_answer: 0,
        explanation_text: 'Mercury is the closest planet to the Sun.',
      },
      {
        question_text: 'What galaxy do we live in?',
        options: ['Andromeda', 'Milky Way', 'Sombrero', 'Whirlpool'],
        correct_answer: 1,
        explanation_text: 'Earth is in the Milky Way galaxy.',
      },
    ],
  };

  const successfulFetch: LmStudioFetch = async (input, init) => {
    observedCalls.push({ input, init });

    return {
      ok: true,
      status: 200,
      async json() {
        return { output: JSON.stringify(quizPayload) };
      },
    };
  };

  const testEndpoint = 'http://127.0.0.1:7321/api/v1/chat';

  const successResult = await requestMcqGenerationFromLmStudio(sharedRequest, {
    endpoint: testEndpoint,
    model: 'google/gemma-4-31b',
    fetchImpl: successfulFetch,
  });

  const observedBody = JSON.parse(observedCalls[0]!.init.body) as LmStudioChatRequest;

  assertDeepEqual(
    observedCalls[0]!.input,
    testEndpoint,
    'sends the request to the configured endpoint',
  );

  assertDeepEqual(
    observedCalls[0]!.init.method,
    'POST',
    'uses POST method',
  );

  assertDeepEqual(
    observedBody.model,
    'google/gemma-4-31b',
    'sends the configured model name',
  );

  assertDeepEqual(
    typeof observedBody.system_prompt,
    'string',
    'includes a system prompt',
  );

  assertDeepEqual(
    observedBody.input.includes('Astronomy'),
    true,
    'includes the topic in the input',
  );

  assertDeepEqual(
    observedBody.input.includes('2'),
    true,
    'includes the question count in the input',
  );

  assertDeepEqual(
    successResult,
    {
      questions: [
        {
          question: 'What is the closest planet to the Sun?',
          options: ['Mercury', 'Venus', 'Earth', 'Mars'],
          correctAnswer: 0,
          explanation: 'Mercury is the closest planet to the Sun.',
        },
        {
          question: 'What galaxy do we live in?',
          options: ['Andromeda', 'Milky Way', 'Sombrero', 'Whirlpool'],
          correctAnswer: 1,
          explanation: 'Earth is in the Milky Way galaxy.',
        },
      ],
    },
    'normalizes a successful LM Studio response into the shared response contract',
  );

  await assertRejectsWithMessage(
    () =>
      requestMcqGenerationFromLmStudio(sharedRequest, {
        endpoint: testEndpoint,
        fetchImpl: async () => {
          throw new Error('ECONNRESET: socket hang up');
        },
      }),
    'LM Studio request failed',
    'wraps transport failures in a safe adapter error',
  );

  await assertRejectsWithMessage(
    () =>
      requestMcqGenerationFromLmStudio(sharedRequest, {
        endpoint: testEndpoint,
        fetchImpl: async () => ({
          ok: true,
          status: 200,
          async json() {
            return {
              output: JSON.stringify({
                questions: [
                  {
                    question_text: 'Broken payload',
                    options: ['A', 'B', 'C'],
                    correct_answer: 0,
                    explanation_text: 'This response is malformed.',
                  },
                ],
              }),
            };
          },
        }),
      }),
    'LM Studio response was invalid',
    'rejects malformed provider responses safely',
  );
}

void main().catch((error) => {
  throw error;
});
