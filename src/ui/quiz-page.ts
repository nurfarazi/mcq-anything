import { generateQuiz, type QuizGenerationInput } from '../app';
import { renderQuizResult } from './quiz-page-render';

/**
 * Minimal user-facing trigger for quiz generation.
 */
export async function renderQuizPage(input: QuizGenerationInput): Promise<string> {
  const result = await generateQuiz(input);

  return renderQuizResult(result);
}
