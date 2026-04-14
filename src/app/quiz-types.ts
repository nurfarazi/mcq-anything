import type { MCQGenerationResponse } from '../llm';

export const APP_ERROR_CODES = [
  'INVALID_INPUT',
  'GENERATION_FAILED',
  'INVALID_MODEL_OUTPUT',
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

export interface AppError {
  code: AppErrorCode;
  message: string;
}

export interface QuizGenerationInput {
  topic: string;
  questionCount: number;
}

export interface QuizGenerationSuccess {
  questions: MCQGenerationResponse['questions'];
}

export interface QuizGenerationFailure {
  ok: false;
  error: AppError;
}

export interface QuizGenerationSuccessResult {
  ok: true;
  value: QuizGenerationSuccess;
}

export type QuizGenerationResult =
  | QuizGenerationSuccessResult
  | QuizGenerationFailure;
