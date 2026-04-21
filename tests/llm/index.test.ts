import {
  DEFAULT_PROVIDER_KEY,
  createProvider,
  parseProviderConfig,
  resolveActiveProviderKey,
  type MCQGenerationRequest,
  type McqProvider,
  type ProviderFactoryOptions,
} from '../../src/llm';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type ProviderFactoryExportShape = Expect<
  Equal<
    McqProvider,
    {
      generate(request: MCQGenerationRequest): Promise<import('../../src/llm').MCQGenerationResponse>;
    }
  >
>;

type ProviderFactoryOptionsShape = Expect<
  Equal<ProviderFactoryOptions, { lmStudio: import('../../src/llm/providers/lm-studio').LmStudioTransportOptions }>
>;

type PublicModuleHasResolver = Expect<Equal<typeof resolveActiveProviderKey, typeof import('../../src/llm/provider-resolution').resolveActiveProviderKey>>;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

async function main(): Promise<void> {
  const parsed = parseProviderConfig({});
  assertDeepEqual(parsed, { provider: DEFAULT_PROVIDER_KEY }, 're-exports config helpers from the public LLM boundary');

  const provider = createProvider(parsed.provider, {
    lmStudio: {
      endpoint: 'http://127.0.0.1:1234/v1/mcq',
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        async json() {
          return {
            output: JSON.stringify({
              questions: [
                {
                  question_text: 'What is the capital of France?',
                  options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
                  correct_answer: 2,
                  explanation_text: 'Paris is the capital city of France.',
                },
              ],
            }),
          };
        },
      }),
    },
  });

  assertDeepEqual(
    await provider.generate({ topic: 'Geography', questionCount: 1 }),
    {
      questions: [
        {
          question: 'What is the capital of France?',
          options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
          correctAnswer: 2,
          explanation: 'Paris is the capital city of France.',
        },
      ],
    },
    'creates a provider through the public LLM boundary',
  );
}

void main().catch((error) => {
  throw error;
});

// @ts-expect-error - concrete provider adapter details must stay hidden from the public boundary.
import { requestMcqGenerationFromLmStudio } from '../../src/llm';
