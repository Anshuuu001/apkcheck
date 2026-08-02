import type { LearningDatabase } from '../learning/learningDb';

export class SkillEngine {
  constructor(private db: LearningDatabase) {}

  /**
   * Increases XP and updates levels for a specific skill profile
   */
  incrementSkill(skillName: string, xpPoints: number): { level: number; totalXp: number } {
    const result = this.db.upgradeSkill(skillName, xpPoints);
    console.log(`[SkillEngine] Skill "${skillName}" leveled to: Lvl ${result.level} (${result.totalXp} XP)`);
    return result;
  }

  /**
   * Fetches current levels merged with standard baseline default statistics
   */
  getSkillReport(): Record<string, number> {
    const defaults: Record<string, number> = {
      'Programming': 32,
      'Database': 28,
      'React Native': 40,
      'UI': 19,
      'Architecture': 10,
      'Testing': 10,
      'Backend': 10,
      'Frontend': 10,
      'Spring Boot': 10,
      'Security': 10,
      'Performance': 10
    };
    
    const dbLevels = this.db.getSkillLevels();
    return { ...defaults, ...dbLevels };
  }
}
