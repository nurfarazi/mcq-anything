import type { MCQGenerationRequest, MCQGenerationResponse } from '../../src/llm/types';
import {
  mapLmStudioResponseToMcqGenerationResponse,
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
  Equal<MCQGenerationResponse, { questions: readonly { question: string; options: readonly [string, string, string, string]; correctAnswer: 0 | 1 | 2 | 3; explanation: string }[] }>
>;

function assertDeepEqual(actual: unknown, expected: unknown, label: string): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, received ${actualJson}`);
  }
}

const providerResponse: LmStudioResponsePayload = {
  questions: [
    {
      question_text: 'What is the main purpose of chlorophyll?',
      options: ['Absorb light', 'Store water', 'Make roots', 'Break rocks'] as const,
      correct_answer: 0,
      explanation_text: 'Chlorophyll absorbs light energy for photosynthesis.',
    },
    {
      question_text: 'Which gas do plants absorb from the air?',
      options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'] as const,
      correct_answer: 1,
      explanation_text: 'Plants use carbon dioxide during photosynthesis.',
    },
  ],
};

assertDeepEqual(
  mapLmStudioResponseToMcqGenerationResponse(providerResponse),
  {
    questions: [
      {
        question: 'What is the main purpose of chlorophyll?',
        options: ['Absorb light', 'Store water', 'Make roots', 'Break rocks'],
        correctAnswer: 0,
        explanation: 'Chlorophyll absorbs light energy for photosynthesis.',
      },
      {
        question: 'Which gas do plants absorb from the air?',
        options: ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Helium'],
        correctAnswer: 1,
        explanation: 'Plants use carbon dioxide during photosynthesis.',
      },
    ],
  },
  'normalizes the provider response into the shared response contract',
);
