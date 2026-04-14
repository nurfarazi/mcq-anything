import type { MCQGenerationRequest, MCQGenerationResponse } from '../types';

export interface LmStudioRequestPayload {
  topic: string;
  question_count: number;
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
  fetchImpl?: LmStudioFetch;
}

/**
 * Convert the shared generation request into an LM Studio-specific payload.
 *
 * This is intentionally structural only: transport, model selection, retries,
 * and request execution belong in the later transport phase.
 */
export function mapMcqGenerationRequestToLmStudioPayload(
  request: MCQGenerationRequest,
): LmStudioRequestPayload {
  return {
    topic: request.topic,
    question_count: request.questionCount,
  };
}

/**
 * Normalize an LM Studio response into the shared MCQ generation contract.
 *
 * Any malformed or incomplete payload handling belongs in the later validation
 * and transport phases; this function only performs field mapping.
 */
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

function toSafeTransportError(reason: string): Error {
  return new Error(`LM Studio request failed: ${reason}`);
}

function toSafeResponseError(reason: string): Error {
  return new Error(`LM Studio response was invalid: ${reason}`);
}

/**
 * Execute the LM Studio request/response cycle using the shared contract.
 *
 * This stays inside the adapter so transport, provider-specific payloads, and
 * safe error handling do not leak into business logic or provider selection.
 */
export async function requestMcqGenerationFromLmStudio(
  request: MCQGenerationRequest,
  options: LmStudioTransportOptions,
): Promise<MCQGenerationResponse> {
  const fetchImpl = options.fetchImpl ?? getGlobalFetch();
  const payload = mapMcqGenerationRequestToLmStudioPayload(request);

  let response: LmStudioFetchResponse;

  try {
    response = await fetchImpl(options.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
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

  if (!isLmStudioResponsePayload(rawResponse)) {
    throw toSafeResponseError('payload shape did not match the expected contract');
  }

  return mapLmStudioResponseToMcqGenerationResponse(rawResponse);
}
