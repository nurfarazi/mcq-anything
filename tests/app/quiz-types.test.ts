import { APP_ERROR_CODES, type AppErrorCode, type QuizGenerationFailure, type QuizGenerationInput, type QuizGenerationResult, type QuizGenerationSuccess } from '../../src/app/quiz-types';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type Expect<T extends true> = T;

type AppErrorCodesShape = Expect<Equal<typeof APP_ERROR_CODES, readonly ['INVALID_INPUT', 'GENERATION_FAILED', 'INVALID_MODEL_OUTPUT']>>;
type AppErrorCodeShape = Expect<Equal<AppErrorCode, 'INVALID_INPUT' | 'GENERATION_FAILED' | 'INVALID_MODEL_OUTPUT'>>;
type InputShape = Expect<Equal<QuizGenerationInput, { topic: string; questionCount: number }>>;
type SuccessShape = Expect<Equal<QuizGenerationSuccess, { questions: import('../../src/llm').MCQGenerationResponse['questions'] }>>;
type FailureShape = Expect<Equal<QuizGenerationFailure, { ok: false; error: { code: AppErrorCode; message: string } }>>;
type ResultShape = Expect<Equal<QuizGenerationResult, QuizGenerationFailure | { ok: true; value: QuizGenerationSuccess }>>;
