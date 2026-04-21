import type { MCQGenerationRequest, MCQGenerationResponse } from '../types';

const DEFAULT_MODEL = 'google/gemma-4-31b';

const SYSTEM_PROMPT =
  'You are a quiz generation assistant. Respond ONLY with valid JSON — no prose, no markdown fences. ' +
  'Use this exact schema: ' +
  '{"questions":[{"question_text":"...","options":["A","B","C","D"],"correct_answer":0,"explanation_text":"..."}]} ' +
  'correct_answer is the 0-based index of the correct option (0, 1, 2, or 3).';

export interface LmStudioChatRequest {
  model: string;
  system_prompt: string;
  input: string;
}

export interface LmStudioChatResponse {
  output: string;
}

export interface LmStudioQuestionPayload {
  question_text: string;
  options: readonly [string, string, string, string];
  correct_answer: 0 | 1 | 2 | 3;
  explanation_text: string;
}

export interface LmStudioResponsePayload {
  questions: readonly LmStudioQuestionPayload[];
}

export interface LmStudioFetchResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type LmStudioFetch = (
  input: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body: string;
  },
) => Promise<LmStudioFetchResponse>;

export interface LmStudioTransportOptions {
  endpoint: string;
  model?: string;
  fetchImpl?: LmStudioFetch;
}

function getGlobalFetch(): LmStudioFetch {
  const globalLike = globalThis as { fetch?: LmStudioFetch };

  if (typeof globalLike.fetch !== 'function') {
    throw new Error('LM Studio transport is unavailable');
  }

  return globalLike.fetch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isLmStudioQuestionPayload(value: unknown): value is LmStudioQuestionPayload {
  if (!isRecord(value)) {
    return false;
  }

  const correctAnswer = value.correct_answer;

  return (
    typeof value.question_text === 'string' &&
    Array.isArray(value.options) &&
    value.options.length === 4 &&
    value.options.every((option) => typeof option === 'string') &&
    typeof correctAnswer === 'number' &&
    Number.isInteger(correctAnswer) &&
    correctAnswer >= 0 &&
    correctAnswer <= 3 &&
    typeof value.explanation_text === 'string'
  );
}

function isLmStudioResponsePayload(value: unknown): value is LmStudioResponsePayload {
  if (!isRecord(value) || !Array.isArray(value.questions)) {
    return false;
  }

  return value.questions.every(isLmStudioQuestionPayload);
}

function isLmStudioChatResponse(value: unknown): value is LmStudioChatResponse {
  return isRecord(value) && typeof value.output === 'string';
}

function extractJsonFromOutput(output: string): unknown {
  // Strip optional markdown code fence the model may wrap around JSON
  const stripped = output.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(stripped);
}

function toSafeTransportError(reason: string): Error {
  return new Error(`LM Studio request failed: ${reason}`);
}

function toSafeResponseError(reason: string): Error {
  return new Error(`LM Studio response was invalid: ${reason}`);
}

export function mapLmStudioResponseToMcqGenerationResponse(
  response: LmStudioResponsePayload,
): MCQGenerationResponse {
  return {
    questions: response.questions.map((question) => ({
      question: question.question_text,
      options: question.options,
      correctAnswer: question.correct_answer,
      explanation: question.explanation_text,
    })),
  };
}

export async function requestMcqGenerationFromLmStudio(
  request: MCQGenerationRequest,
  options: LmStudioTransportOptions,
): Promise<MCQGenerationResponse> {
  const fetchImpl = options.fetchImpl ?? getGlobalFetch();
  const model = options.model ?? DEFAULT_MODEL;

  const chatRequest: LmStudioChatRequest = {
    model,
    system_prompt: SYSTEM_PROMPT,
    input: `Generate ${request.questionCount} multiple choice questions about ${request.topic}.`,
  };

  let response: LmStudioFetchResponse;

  try {
    response = await fetchImpl(options.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(chatRequest),
    });
  } catch {
    throw toSafeTransportError('request could not be completed');
  }

  if (!response.ok) {
    throw toSafeTransportError(`unexpected status ${response.status}`);
  }

  let rawResponse: unknown;

  try {
    rawResponse = await response.json();
  } catch {
    throw toSafeResponseError('response body could not be parsed');
  }

  if (!isLmStudioChatResponse(rawResponse)) {
    throw toSafeResponseError('response did not contain an output field');
  }

  let parsedOutput: unknown;

  try {
    parsedOutput = extractJsonFromOutput(rawResponse.output);
  } catch {
    throw toSafeResponseError('output field did not contain valid JSON');
  }

  if (!isLmStudioResponsePayload(parsedOutput)) {
    throw toSafeResponseError('payload shape did not match the expected contract');
  }

  return mapLmStudioResponseToMcqGenerationResponse(parsedOutput);
}
