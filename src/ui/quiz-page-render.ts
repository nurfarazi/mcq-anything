import type { QuizSession } from '../app/quiz-session';
import type { AppErrorCode } from '../app/quiz-types';

export type QuizPageViewModel =
  | {
      kind: 'success';
      sessionId: string;
      topic: string;
      attemptEndpoint: string;
      initialProgressLabel: string;
      questions: ReadonlyArray<RenderedQuestion>;
    }
  | {
      kind: 'error';
      error: RenderedError;
    };

export interface RenderedQuestion {
  question: string;
  options: readonly [string, string, string, string];
}

export interface RenderedError {
  code: AppErrorCode;
  message: string;
}

export function toQuizPageViewModel(session: QuizSession): QuizPageViewModel {
  return {
    kind: 'success',
    sessionId: session.id,
    topic: session.topic,
    attemptEndpoint: `/quizzes/${session.id}/attempts`,
    initialProgressLabel: `Question 1 of ${session.questions.length}`,
    questions: session.questions.map((question) => ({
      question: question.question,
      options: question.options,
    })),
  };
}

export function toQuizPageErrorViewModel(error: RenderedError): QuizPageViewModel {
  return {
    kind: 'error',
    error: {
      code: error.code,
      message: error.message,
    },
  };
}
