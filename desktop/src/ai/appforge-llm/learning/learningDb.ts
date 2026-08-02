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

  // Blueprint Database methods
  saveBlueprintVersion(projectId: number, version: string, blueprintJson: string, description: string): void;
  getBlueprintVersions(projectId: number): any[];
  rollbackBlueprint(versionId: number): string | null;

  // Build Memory methods
  logBuildError(errorSignature: string, appliedFix: string): void;
  findBuildFix(errorSignature: string): string | null;

  // Project Knowledge Memory (Step 10)
  saveProject(projectId: number, blueprintJson: string, generatedFiles: string[], rating?: number): void;
  loadProject(projectId: number): ProjectMemoryRecord | null;
  listProjects(): ProjectMemoryRecord[];
  updateProjectRating(projectId: number, rating: number): void;
}

export interface ProjectMemoryRecord {
  id?: number;
  project_id: number;
  blueprint_json: string;
  generated_files: string;   // JSON array
  user_changes?: string;     // JSON diff
  error_log?: string;        // Build errors
  fix_log?: string;          // Applied fixes
  rating?: number;           // 1-5
  created_at?: string;
  updated_at?: string;
}

class JsonLearningDatabase implements LearningDatabase {
  private filePath: string;
  private data: {
    prompt_history: PromptHistoryRecord[];
    mistakes: any[];
    corrections: any[];
    skills: Record<string, { level: number; xp_points: number }>;
    experience_logs: { points: number; reason: string; created_at: string }[];
    blueprint_versions: { id: number; project_id: number; version: string; blueprint_json: string; description: string; created_at: string }[];
    build_memory: { id: number; error_signature: string; applied_fix: string; success_count: number; created_at: string }[];
    project_memory: ProjectMemoryRecord[];
  };

  constructor(dir: string) {
    this.filePath = path.join(dir, 'learning_fallback.json');
    this.data = { 
      prompt_history: [], 
      mistakes: [], 
      corrections: [], 
      skills: {}, 
      experience_logs: [],
      blueprint_versions: [],
      build_memory: [],
      project_memory: []
    };
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
        if (!this.data.blueprint_versions) this.data.blueprint_versions = [];
        if (!this.data.build_memory) this.data.build_memory = [];
        if (!this.data.project_memory) this.data.project_memory = [];
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
    const records = this.data.prompt_history.filter(r => r.user_prompt.toLowerCase().includes(domain.toLowerCase()));
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + r.confidence, 0);
    return sum / records.length;
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
    let skill = this.data.skills[skillName];
    if (!skill) {
      skill = { level: 1, xp_points: 0 };
    }
    const nextXp = skill.xp_points + xpEarned;
    const nextLevel = Math.max(1, Math.floor(nextXp / 100) + 1);
    
    this.data.skills[skillName] = { level: nextLevel, xp_points: nextXp };
    this.save();
    return { level: nextLevel, totalXp: nextXp };
  }

  getSkillLevels(): Record<string, number> {
    const res: Record<string, number> = {};
    Object.keys(this.data.skills).forEach(key => {
      res[key] = this.data.skills[key].level;
    });
    return res;
  }

  saveBlueprintVersion(projectId: number, version: string, blueprintJson: string, description: string): void {
    this.data.blueprint_versions.push({
      id: this.data.blueprint_versions.length + 1,
      project_id: projectId,
      version,
      blueprint_json: blueprintJson,
      description,
      created_at: new Date().toISOString()
    });
    this.save();
  }

  getBlueprintVersions(projectId: number): any[] {
    return this.data.blueprint_versions.filter(v => v.project_id === projectId);
  }

  rollbackBlueprint(versionId: number): string | null {
    const match = this.data.blueprint_versions.find(v => v.id === versionId);
    return match ? match.blueprint_json : null;
  }

  logBuildError(errorSignature: string, appliedFix: string): void {
    const existing = this.data.build_memory.find(b => b.error_signature.toLowerCase() === errorSignature.toLowerCase());
    if (existing) {
      existing.applied_fix = appliedFix;
      existing.success_count += 1;
    } else {
      this.data.build_memory.push({
        id: this.data.build_memory.length + 1,
        error_signature: errorSignature,
        applied_fix: appliedFix,
        success_count: 1,
        created_at: new Date().toISOString()
      });
    }
    this.save();
  }

  findBuildFix(errorSignature: string): string | null {
    const match = this.data.build_memory.find(b => errorSignature.toLowerCase().includes(b.error_signature.toLowerCase()));
    return match ? match.applied_fix : null;
  }

  saveProject(projectId: number, blueprintJson: string, generatedFiles: string[], rating?: number): void {
    const existing = this.data.project_memory.find(p => p.project_id === projectId);
    if (existing) {
      existing.blueprint_json = blueprintJson;
      existing.generated_files = JSON.stringify(generatedFiles);
      if (rating !== undefined) existing.rating = rating;
    } else {
      this.data.project_memory.push({
        project_id: projectId,
        blueprint_json: blueprintJson,
        generated_files: JSON.stringify(generatedFiles),
        rating,
        created_at: new Date().toISOString(),
      });
    }
    this.save();
  }

  loadProject(projectId: number): ProjectMemoryRecord | null {
    return this.data.project_memory.find(p => p.project_id === projectId) ?? null;
  }

  listProjects(): ProjectMemoryRecord[] {
    return [...this.data.project_memory];
  }

  updateProjectRating(projectId: number, rating: number): void {
    const record = this.data.project_memory.find(p => p.project_id === projectId);
    if (record) { record.rating = rating; this.save(); }
  }
}

class SqliteLearningDatabase implements LearningDatabase {
  private db: any;

  constructor(dbPath: string) {
    const Database = require('better-sqlite3');
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS prompt_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_prompt TEXT,
        response_data TEXT,
        source_llm TEXT,
        confidence REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS mistakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_prompt TEXT,
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
      CREATE TABLE IF NOT EXISTS blueprint_versions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        version TEXT,
        blueprint_json TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS build_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        error_signature TEXT UNIQUE,
        applied_fix TEXT,
        success_count INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS project_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER UNIQUE,
        blueprint_json TEXT,
        generated_files TEXT,
        user_changes TEXT,
        error_log TEXT,
        fix_log TEXT,
        rating INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

  saveBlueprintVersion(projectId: number, version: string, blueprintJson: string, description: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO blueprint_versions (project_id, version, blueprint_json, description)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(projectId, version, blueprintJson, description);
  }

  getBlueprintVersions(projectId: number): any[] {
    return this.db.prepare('SELECT * FROM blueprint_versions WHERE project_id = ? ORDER BY id DESC').all(projectId);
  }

  rollbackBlueprint(versionId: number): string | null {
    const row = this.db.prepare('SELECT blueprint_json FROM blueprint_versions WHERE id = ?').get(versionId);
    return row ? row.blueprint_json : null;
  }

  logBuildError(errorSignature: string, appliedFix: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO build_memory (error_signature, applied_fix, success_count)
      VALUES (?, ?, 1)
      ON CONFLICT(error_signature) DO UPDATE SET
        applied_fix = excluded.applied_fix,
        success_count = success_count + 1
    `);
    stmt.run(errorSignature, appliedFix);
  }

  findBuildFix(errorSignature: string): string | null {
    const row = this.db.prepare(`
      SELECT applied_fix FROM build_memory 
      WHERE ? LIKE '%' || error_signature || '%'
    `).get(errorSignature);
    return row ? row.applied_fix : null;
  }

  saveProject(projectId: number, blueprintJson: string, generatedFiles: string[], rating?: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO project_memory (project_id, blueprint_json, generated_files, rating, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(project_id) DO UPDATE SET
        blueprint_json = excluded.blueprint_json,
        generated_files = excluded.generated_files,
        rating = COALESCE(excluded.rating, project_memory.rating),
        updated_at = CURRENT_TIMESTAMP
    `);
    stmt.run(projectId, blueprintJson, JSON.stringify(generatedFiles), rating ?? null);
  }

  loadProject(projectId: number): ProjectMemoryRecord | null {
    return this.db.prepare('SELECT * FROM project_memory WHERE project_id = ?').get(projectId) ?? null;
  }

  listProjects(): ProjectMemoryRecord[] {
    return this.db.prepare('SELECT * FROM project_memory ORDER BY updated_at DESC').all();
  }

  updateProjectRating(projectId: number, rating: number): void {
    this.db.prepare('UPDATE project_memory SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?').run(rating, projectId);
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
