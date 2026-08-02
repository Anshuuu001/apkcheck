import type { LearningDatabase } from './learningDb';

export class FeedbackTrainer {
  constructor(private db: LearningDatabase) {}

  /**
   * Tracks rating or updates given by users in the UI workspace editor
   */
  logFeedback(projectId: number, rating: number, comments: string): void {
    console.log(`[FeedbackTrainer] User feedback logged: Project #${projectId} -> Score: ${rating}/5. ${comments}`);
  }
}
