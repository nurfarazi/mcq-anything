import type { QuizSession } from './quiz-session';

export interface QuizPersistencePort {
  saveSession(session: QuizSession): Promise<void>;
  listSessions(): Promise<readonly QuizSession[]>;
  getSessionById(id: string): Promise<QuizSession | null>;
}
