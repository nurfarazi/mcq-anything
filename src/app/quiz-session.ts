import type { MCQGenerationResponse } from '../llm';

export interface QuizSession {
  id: string;
  topic: string;
  questions: MCQGenerationResponse['questions'];
  createdAt: string;
}

export interface CreateQuizSessionOptions {
  idFactory?: () => string;
  clock?: () => Date;
}

let fallbackSessionCounter = 0;

function generateQuizSessionId(): string {
  const cryptoLike = globalThis as {
    crypto?: { randomUUID?: () => string };
  };

  const randomUuid = cryptoLike.crypto?.randomUUID?.();

  if (typeof randomUuid === 'string' && randomUuid.trim().length > 0) {
    return randomUuid;
  }

  fallbackSessionCounter += 1;
  const timestamp = Date.now().toString(36);
  const counter = fallbackSessionCounter.toString(36);

  return `quiz-${timestamp}-${counter}`;
}

function toIsoTimestamp(value: Date): string {
  return value.toISOString();
}

export function createQuizSession(
  topic: string,
  questions: MCQGenerationResponse['questions'],
  options: CreateQuizSessionOptions = {},
): QuizSession {
  const id = options.idFactory?.() ?? generateQuizSessionId();
  const createdAt = toIsoTimestamp(options.clock?.() ?? new Date());

  return {
    id,
    topic,
    questions,
    createdAt,
  };
}
