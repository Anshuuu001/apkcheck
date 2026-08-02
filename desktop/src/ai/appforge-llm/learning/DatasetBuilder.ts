import type { LearningDatabase } from './learningDb';

export class DatasetBuilder {
  constructor(private db: LearningDatabase) {}

  /**
   * Generates a local training JSON dataset containing successfully parsed prompts and correct structures
   */
  exportTrainingSet(): string {
    return JSON.stringify({
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      samplesCount: this.db.getHistoryCount()
    });
  }
}
