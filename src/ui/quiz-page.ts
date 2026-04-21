import { generateQuiz, type QuizGenerationInput } from '../app';
import { toQuizPageErrorViewModel, toQuizPageViewModel } from './quiz-page-render';
import { renderQuizPageHtml } from './quiz-page-html';
import { createQuizSession } from '../app/quiz-session';

/**
 * Minimal user-facing trigger for quiz generation.
 */
export async function renderQuizPage(input: QuizGenerationInput): Promise<string> {
  const result = await generateQuiz(input);

  if (!result.ok) {
    return renderQuizPageHtml(toQuizPageErrorViewModel(result.error));
  }

  const previewSession = createQuizSession(input.topic.trim(), result.value.questions, {
    idFactory: () => 'preview-session',
    clock: () => new Date('2026-04-22T00:00:00.000Z'),
  });

  return renderQuizPageHtml(toQuizPageViewModel(previewSession));
}
