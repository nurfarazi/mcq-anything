/**
 * Provider-neutral request for generating MCQs.
 *
 * Runtime validation should enforce this boundary when untrusted input enters
 * the LLM layer in a later phase. For now, this file only defines the contract.
 */
export interface MCQGenerationRequest {
  topic: string;
  questionCount: number;
}

/**
 * The zero-based index of the correct option in the `options` tuple.
 *
 * This keeps the contract provider-neutral and avoids duplicating answer text
 * across providers or validation layers.
 */
export type MCQCorrectAnswerIndex = 0 | 1 | 2 | 3;

/**
 * A strict multiple-choice question contract shared by every provider.
 *
 * The runtime boundary should validate that:
 * - `question` is non-empty
 * - `options` always contains exactly four entries
 * - `correctAnswer` is one of the four option indexes
 * - `explanation` is present
 *
 * This type intentionally captures only the structural shape, not validation
 * logic or provider-specific transport details.
 */
export interface MCQ {
  question: string;
  options: readonly [string, string, string, string];
  correctAnswer: MCQCorrectAnswerIndex;
  explanation: string;
}

/**
 * Provider-neutral generation output.
 *
 * The later validation phase will ensure this shape is safe before the UI
 * consumes it.
 */
export interface MCQGenerationResponse {
  questions: readonly MCQ[];
}
