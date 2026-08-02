import path from 'path';
import fs from 'fs';

export interface PromptHistoryRecord {
  id?: number;
  user_prompt: string;
  response_data: string;
  source_llm: string;
  confidence: number;
  created_at?: string;
}

export interface SkillProgress {
  skill_name: string;
  level: number;
  xp_points: number;
}

export interface LearningDatabase {
  logPrompt(record: PromptHistoryRecord): void;
  getHistoryCount(): number;
  getAverageConfidence(domain: string): number;
  recordXP(points: number, reason: string): void;
  upgradeSkill(skillName: string, xpEarned: number): { level: number; totalXp: number };
  getSkillLevels(): Record<string, number>;
}

class JsonLearningDatabase implements LearningDatabase {
  private filePath: string;
  private data: {
    prompt_history: PromptHistoryRecord[];
    mistakes: any[];
    corrections: any[];
    skills: Record<string, { level: number; xp_points: number }>;
    experience_logs: { points: number; reason: string; created_at: string }[];
  };

  constructor(dir: string) {
    this.filePath = path.join(dir, 'learning_fallback.json');
    this.data = { prompt_history: [], mistakes: [], corrections: [], skills: {}, experience_logs: [] };
    this.load();
  }

  private load() {
    if (fs.existsSync(this.filePath)) {
      try {
        const content = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(content);
        if (!this.data.prompt_history) this.data.prompt_history = [];
        if (!this.data.mistakes) this.data.mistakes = [];
        if (!this.data.corrections) this.data.corrections = [];
        if (!this.data.skills) this.data.skills = {};
        if (!this.data.experience_logs) this.data.experience_logs = [];
      } catch (e) {
        console.warn('[JsonLearningDatabase] Error loading fallback file:', e);
      }
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('[JsonLearningDatabase] Error saving fallback file:', e);
    }
  }

  logPrompt(record: PromptHistoryRecord): void {
    const newRecord = {
      id: this.data.prompt_history.length + 1,
      ...record,
      created_at: new Date().toISOString()
    };
    this.data.prompt_history.push(newRecord);
    this.save();
  }

  getHistoryCount(): number {
    return this.data.prompt_history.length;
  }

  getAverageConfidence(domain: string): number {
    const matches = this.data.prompt_history.filter(h => 
      h.user_prompt.toLowerCase().includes(domain.toLowerCase())
    );
    if (matches.length === 0) return 0;
    const sum = matches.reduce((acc, h) => acc + h.confidence, 0);
    return sum / matches.length;
  }

  recordXP(points: number, reason: string): void {
    this.data.experience_logs.push({
      points,
      reason,
      created_at: new Date().toISOString()
    });
    this.save();
  }

  upgradeSkill(skillName: string, xpEarned: number): { level: number; totalXp: number } {
    if (!this.data.skills[skillName]) {
      this.data.skills[skillName] = { level: 1, xp_points: 0 };
    }
    
    const skill = this.data.skills[skillName];
    skill.xp_points += xpEarned;
    
    // Skill levels up every 100 XP
    const newLevel = Math.max(1, Math.floor(skill.xp_points / 100) + 1);
    if (newLevel > skill.level) {
      skill.level = newLevel;
    }
    
    this.save();
    return { level: skill.level, totalXp: skill.xp_points };
  }

  getSkillLevels(): Record<string, number> {
    const res: Record<string, number> = {};
    Object.keys(this.data.skills).forEach(k => {
      res[k] = this.data.skills[k].level;
    });
    return res;
  }
}

class SqliteLearningDatabase implements LearningDatabase {
  private db: any;

  constructor(dbPath: string) {
    const Database = require('better-sqlite3');
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prompt_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_prompt TEXT NOT NULL,
        response_data TEXT,
        source_llm TEXT,
        confidence REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS mistakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        module_name TEXT,
        description TEXT,
        corrected_module_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS corrections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mistake_id INTEGER,
        user_feedback TEXT,
        system_updates TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS ai_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        skill_name TEXT UNIQUE,
        level INTEGER DEFAULT 1,
        xp_points INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS ai_experience (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        xp_earned INTEGER,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  logPrompt(record: PromptHistoryRecord): void {
    const stmt = this.db.prepare(`
      INSERT INTO prompt_history (user_prompt, response_data, source_llm, confidence)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(record.user_prompt, record.response_data, record.source_llm, record.confidence);
  }

  getHistoryCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as count FROM prompt_history').get();
    return row ? row.count : 0;
  }

  getAverageConfidence(domain: string): number {
    const row = this.db.prepare(`
      SELECT AVG(confidence) as avgConf FROM prompt_history 
      WHERE user_prompt LIKE ?
    `).get(`%${domain}%`);
    return row && row.avgConf !== null ? row.avgConf : 0;
  }

  recordXP(points: number, reason: string): void {
    const stmt = this.db.prepare('INSERT INTO ai_experience (xp_earned, reason) VALUES (?, ?)');
    stmt.run(points, reason);
  }

  upgradeSkill(skillName: string, xpEarned: number): { level: number; totalXp: number } {
    // Check if skill exists
    const getSkill = this.db.prepare('SELECT level, xp_points FROM ai_skills WHERE skill_name = ?');
    let skill = getSkill.get(skillName);
    
    if (!skill) {
      const insert = this.db.prepare('INSERT INTO ai_skills (skill_name, level, xp_points) VALUES (?, 1, 0)');
      insert.run(skillName);
      skill = { level: 1, xp_points: 0 };
    }

    const nextXp = skill.xp_points + xpEarned;
    const nextLevel = Math.max(1, Math.floor(nextXp / 100) + 1);

    const update = this.db.prepare('UPDATE ai_skills SET level = ?, xp_points = ?, updated_at = CURRENT_TIMESTAMP WHERE skill_name = ?');
    update.run(nextLevel, nextXp, skillName);

    return { level: nextLevel, totalXp: nextXp };
  }

  getSkillLevels(): Record<string, number> {
    const rows = this.db.prepare('SELECT skill_name, level FROM ai_skills').all();
    const res: Record<string, number> = {};
    rows.forEach((r: any) => {
      res[r.skill_name] = r.level;
    });
    return res;
  }
}

export function initLearningDatabase(projectsDir: string): LearningDatabase {
  const dbPath = path.join(projectsDir, 'learning.db');
  try {
    return new SqliteLearningDatabase(dbPath);
  } catch (err) {
    console.warn('[learningDb] SQLite initialization failed, falling back to JSON database:', err);
    return new JsonLearningDatabase(projectsDir);
  }
}
