import type { LearningDatabase } from '../learning/learningDb';

export class ExperienceSystem {
  constructor(private db: LearningDatabase) {}

  /**
   * Evaluates project industry and complexity to grant XP rewards
   */
  rewardProjectXP(projectId: number, industry: string): number {
    let xp = 45; // baseline XP
    
    if (industry.toLowerCase().includes('hospital') || industry.toLowerCase().includes('health')) {
      xp = 80;
    } else if (industry.toLowerCase().includes('crm') || industry.toLowerCase().includes('booking')) {
      xp = 60;
    } else if (industry.toLowerCase().includes('delivery') || industry.toLowerCase().includes('ecommerce')) {
      xp = 50;
    }

    this.db.recordXP(xp, `Compiled master blueprint for project #${projectId} (${industry})`);
    console.log(`[ExperienceSystem] Project #${projectId} completed! Awarded +${xp} XP. (Reason: ${industry})`);
    return xp;
  }
}
