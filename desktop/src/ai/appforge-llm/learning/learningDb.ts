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

export interface LearningDatabase {
  logPrompt(record: PromptHistoryRecord): void;
  getHistoryCount(): number;
  getAverageConfidence(domain: string): number;
}

class JsonLearningDatabase implements LearningDatabase {
  private filePath: string;
  private data: {
    prompt_history: PromptHistoryRecord[];
    mistakes: any[];
    corrections: any[];
  };

  constructor(dir: string) {
    this.filePath = path.join(dir, 'learning_fallback.json');
    this.data = { prompt_history: [], mistakes: [], corrections: [] };
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
