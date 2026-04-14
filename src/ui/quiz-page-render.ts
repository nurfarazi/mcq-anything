import type { AppErrorCode, QuizGenerationResult, QuizGenerationSuccess } from '../app/quiz-types';

export type QuizPageViewModel =
  | {
      kind: 'success';
      questions: ReadonlyArray<RenderedQuestion>;
    }
  | {
      kind: 'error';
      error: RenderedError;
    };

export interface RenderedQuestion {
  question: string;
  options: readonly [string, string, string, string];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface RenderedError {
  code: AppErrorCode;
  message: string;
}

function toAnswerLabel(index: number): 'A' | 'B' | 'C' | 'D' {
  return ['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D';
}

function renderQuestion(question: RenderedQuestion, index: number): string {
  const lines = [
    `${index + 1}. ${question.question}`,
    `  A. ${question.options[0]}`,
    `  B. ${question.options[1]}`,
    `  C. ${question.options[2]}`,
    `  D. ${question.options[3]}`,
    `  Correct answer: ${question.correctAnswer}`,
    `  Explanation: ${question.explanation}`,
  ];

  return lines.join('\n');
}

/**
 * Convert the app-layer quiz result into a deterministic renderable view model.
 */
export function toQuizPageViewModel(result: QuizGenerationResult): QuizPageViewModel {
  if (result.ok === true) {
    return {
      kind: 'success',
      questions: result.value.questions.map((question) => ({
        question: question.question,
        options: question.options,
        correctAnswer: toAnswerLabel(question.correctAnswer),
        explanation: question.explanation,
      })),
    };
  }

  return {
    kind: 'error',
    error: {
      code: result.error.code,
      message: result.error.message,
    },
  };
}

/**
 * Render a view model into a deterministic text presentation.
 */
export function renderQuizPage(viewModel: QuizPageViewModel): string {
  if (viewModel.kind === 'error') {
    return [
      `Error: ${viewModel.error.code}`,
      `Message: ${viewModel.error.message}`,
    ].join('\n');
  }

  const header = 'Generated MCQs';
  const body = viewModel.questions.map(renderQuestion).join('\n\n');

  return [header, body].join('\n\n');
}

/**
 * Convenience helper for rendering the app result directly.
 */
export function renderQuizResult(result: QuizGenerationResult): string {
  return renderQuizPage(toQuizPageViewModel(result));
}
