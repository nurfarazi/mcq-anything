import type { MCQGenerationResponse } from '../llm';
import type { QuizAnswerValue, QuizAttemptQuestionResult, QuizAttemptScore } from './quiz-attempt';

export interface QuizAttemptEvaluation {
  score: QuizAttemptScore;
  questions: readonly QuizAttemptQuestionResult[];
}

type QuizQuestion = MCQGenerationResponse['questions'][number];

export function scoreQuizAnswers(
  questions: readonly QuizQuestion[],
  answers: readonly QuizAnswerValue[],
): QuizAttemptEvaluation {
  const questionResults = questions.map((question, questionIndex) => {
    const selectedAnswer = answers[questionIndex]!;

    return {
      questionIndex,
      question: question.question,
      options: question.options,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
      explanation: question.explanation,
    } satisfies QuizAttemptQuestionResult;
  });

  const correctCount = questionResults.filter((question) => question.isCorrect).length;
  const totalQuestions = questionResults.length;
  const percentage = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

  return {
    score: {
      correctCount,
      totalQuestions,
      percentage,
    },
    questions: questionResults,
  };
}