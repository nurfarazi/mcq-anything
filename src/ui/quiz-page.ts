import { generateQuiz, type QuizGenerationInput } from '../app';
import { toQuizPageViewModel } from './quiz-page-render';
import { renderQuizPageHtml } from './quiz-page-html';

/**
 * Minimal user-facing trigger for quiz generation.
 */
export async function renderQuizPage(input: QuizGenerationInput): Promise<string> {
  const result = await generateQuiz(input);

  return renderQuizPageHtml(toQuizPageViewModel(result));
}
