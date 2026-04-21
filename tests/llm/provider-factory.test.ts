import type { McqProvider, ProviderFactoryOptions } from '../../src/llm/provider-factory';
import { createProvider } from '../../src/llm/provider-factory';
import type { LmStudioChatRequest } from '../../src/llm/providers/lm-studio';

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

async function main(): Promise<void> {
  const observedCalls: Array<{
    input: string;
    body: LmStudioChatRequest;
  }> = [];

  const quizPayload = {
    questions: [
      {
        question_text: 'What is 2 + 2?',
        options: ['1', '2', '3', '4'],
        correct_answer: 3,
        explanation_text: '2 + 2 equals 4.',
      },
    ],
  };

  const fetchImpl = async (input: string, init: { method: string; headers: Record<string, string>; body: string }) => {
    observedCalls.push({ input, body: JSON.parse(init.body) as LmStudioChatRequest });

    return {
      ok: true,
      status: 200,
      async json() {
        return { output: JSON.stringify(quizPayload) };
      },
    };
  };

  const testEndpoint = 'http://127.0.0.1:7321/api/v1/chat';

  const options: ProviderFactoryOptions = {
    lmStudio: {
      endpoint: testEndpoint,
      model: 'google/gemma-4-31b',
      fetchImpl,
    },
  };

  const provider = createProvider('lm-studio', options);
  const result = await provider.generate({ topic: 'Math', questionCount: 1 });

  assertDeepEqual(
    observedCalls[0]!.input,
    testEndpoint,
    'sends the request to the configured LM Studio endpoint',
  );

  assertDeepEqual(
    observedCalls[0]!.body.model,
    'google/gemma-4-31b',
    'uses the LM Studio adapter with the configured model',
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
