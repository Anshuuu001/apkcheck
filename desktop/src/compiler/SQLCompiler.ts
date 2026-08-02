import type { AppBlueprint, DatabaseTable, TableField, ForeignKey, TableIndex } from '../blueprint/schema';

/**
 * SQLCompiler — Deterministic Database Schema Generator.
 *
 * Blueprint.database → Full MySQL schema with:
 * - Numbered migration files (001_create_table.sql)
 * - Seed data SQL
 * - Indexes for performance
 * - FK constraints
 * - Full schema dump
 */
export class SQLCompiler {

  static compile(blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};
    const { database, name: appName } = blueprint;
    const { tables, relationships, seedData } = database;

    // ── 1. Migration files ──────────────────────────────────────────────────
    tables.forEach((table, idx) => {
      const num = String(idx + 1).padStart(3, '0');
      files[`database/migrations/${num}_create_${table.name.toLowerCase()}.sql`] =
        SQLCompiler.generateCreateTable(table);
    });

    // ── 2. Relationships / FK constraints ───────────────────────────────────
    if (relationships.length > 0) {
      files['database/constraints.sql'] = SQLCompiler.generateConstraints(tables, relationships);
    }

    // ── 3. Indexes ──────────────────────────────────────────────────────────
    files['database/indexes.sql'] = SQLCompiler.generateIndexes(tables);

    // ── 4. Seed data ────────────────────────────────────────────────────────
    if (seedData && seedData.length > 0) {
      files['database/seeds/seed_data.sql'] = SQLCompiler.generateSeeds(seedData);
    }

    // ── 5. Default admin seed ────────────────────────────────────────────────
    const userTable = tables.find(t => t.name.toLowerCase().includes('user'));
    if (userTable) {
      files['database/seeds/seed_admin.sql'] = SQLCompiler.generateAdminSeed(userTable.name);
    }

    // ── 6. Full schema dump ─────────────────────────────────────────────────
    files['database/schema.sql'] = SQLCompiler.generateFullSchema(appName, tables, relationships);

    return files;
  }

  // ── CREATE TABLE ──────────────────────────────────────────────────────────

  static generateCreateTable(table: DatabaseTable): string {
    const lines: string[] = [];

    lines.push(`-- Migration: Create ${table.name} table`);
    lines.push(`-- ${table.comment}`);
    lines.push('');
    lines.push(`CREATE TABLE IF NOT EXISTS \`${table.name}\` (`);

    const fieldLines: string[] = [];
    table.fields.forEach(field => {
      fieldLines.push('  ' + SQLCompiler.fieldToSQL(field));
    });

    // Inline foreign key constraints
    table.foreignKeys?.forEach(fk => {
      fieldLines.push(`  CONSTRAINT \`fk_${table.name}_${fk.field}\``);
      fieldLines.push(`    FOREIGN KEY (\`${fk.field}\`)`);
      fieldLines.push(`    REFERENCES \`${fk.referencesTable}\` (\`${fk.referencesField}\`)`);
      fieldLines.push(`    ON DELETE ${fk.onDelete}`);
      fieldLines.push(`    ON UPDATE ${fk.onUpdate}`);
    });

    lines.push(fieldLines.join(',\n'));
    lines.push(') ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;');
    lines.push('');

    return lines.join('\n');
  }

  private static fieldToSQL(field: TableField): string {
    const parts: string[] = [];

    parts.push(`\`${field.name}\``);

    // Type
    if (field.type === 'VARCHAR' && field.length) {
      parts.push(`VARCHAR(${field.length})`);
    } else if (field.type === 'ENUM' && field.enumValues) {
      parts.push(`ENUM(${field.enumValues.map(v => `'${v}'`).join(', ')})`);
    } else if (field.type === 'DECIMAL') {
      parts.push('DECIMAL(10, 2)');
    } else {
      parts.push(field.type);
    }

    if (!field.nullable) parts.push('NOT NULL');
    if (field.autoIncrement) parts.push('AUTO_INCREMENT');
    if (field.unique) parts.push('UNIQUE');
    if (field.defaultValue !== undefined) parts.push(`DEFAULT ${field.defaultValue}`);
    if (field.primaryKey) parts.push('PRIMARY KEY');
    if (field.comment) parts.push(`COMMENT '${field.comment}'`);

    return parts.join(' ');
  }

  // ── CONSTRAINTS ───────────────────────────────────────────────────────────

  static generateConstraints(tables: DatabaseTable[], relationships: AppBlueprint['database']['relationships']): string {
    const lines: string[] = [];
    lines.push('-- Foreign Key Constraints');
    lines.push('-- Applied after all tables are created');
    lines.push('');
    lines.push('SET FOREIGN_KEY_CHECKS = 0;');
    lines.push('');

    relationships.forEach(rel => {
      if (rel.type === 'MANY_TO_MANY' && rel.through) {
        lines.push(`-- ${rel.from} ↔ ${rel.to} via ${rel.through}`);
        lines.push(`CREATE TABLE IF NOT EXISTS \`${rel.through}\` (`);
        lines.push(`  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,`);
        lines.push(`  \`${rel.from.toLowerCase()}_id\` INT UNSIGNED NOT NULL,`);
        lines.push(`  \`${rel.to.toLowerCase()}_id\` INT UNSIGNED NOT NULL,`);
        lines.push(`  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`);
        lines.push(`  FOREIGN KEY (\`${rel.from.toLowerCase()}_id\`) REFERENCES \`${rel.from}\`(\`id\`) ON DELETE CASCADE,`);
        lines.push(`  FOREIGN KEY (\`${rel.to.toLowerCase()}_id\`) REFERENCES \`${rel.to}\`(\`id\`) ON DELETE CASCADE`);
        lines.push(') ENGINE=InnoDB;');
        lines.push('');
      }
    });

    lines.push('SET FOREIGN_KEY_CHECKS = 1;');

    return lines.join('\n');
  }

  // ── INDEXES ───────────────────────────────────────────────────────────────

  static generateIndexes(tables: DatabaseTable[]): string {
    const lines: string[] = [];
    lines.push('-- Performance Indexes');
    lines.push('-- Run after schema creation for optimal query performance');
    lines.push('');

    tables.forEach(table => {
      // Auto-index all FK columns
      table.foreignKeys?.forEach(fk => {
        lines.push(`CREATE INDEX IF NOT EXISTS \`idx_${table.name}_${fk.field}\``);
        lines.push(`  ON \`${table.name}\` (\`${fk.field}\`);`);
        lines.push('');
      });

      // Declared indexes
      table.indexes?.forEach(idx => {
        const unique = idx.unique ? 'UNIQUE ' : '';
        lines.push(`CREATE ${unique}INDEX IF NOT EXISTS \`${idx.name}\``);
        lines.push(`  ON \`${table.name}\` (${idx.fields.map(f => `\`${f}\``).join(', ')});`);
        lines.push('');
      });

      // Auto-index common status/date columns
      const autoIndexCols = table.fields.filter(f =>
        ['status', 'created_at', 'email', 'phone', 'role'].includes(f.name) && !f.primaryKey
      );
      autoIndexCols.forEach(f => {
        lines.push(`CREATE INDEX IF NOT EXISTS \`idx_${table.name}_${f.name}\``);
        lines.push(`  ON \`${table.name}\` (\`${f.name}\`);`);
        lines.push('');
      });
    });

    return lines.join('\n');
  }

  // ── SEEDS ─────────────────────────────────────────────────────────────────

  static generateSeeds(seedData: NonNullable<AppBlueprint['database']['seedData']>): string {
    const lines: string[] = [];
    lines.push('-- Demo / Test Seed Data');
    lines.push('-- INSERT IGNORE prevents duplicate seed errors');
    lines.push('');

    seedData.forEach(({ table, rows }) => {
      if (rows.length === 0) return;
      const columns = Object.keys(rows[0]);
      lines.push(`INSERT IGNORE INTO \`${table}\``);
      lines.push(`  (${columns.map(c => `\`${c}\``).join(', ')})`);
      lines.push('VALUES');
      rows.forEach((row, i) => {
        const values = columns.map(c => {
          const v = row[c];
          if (v === null) return 'NULL';
          if (typeof v === 'boolean') return v ? '1' : '0';
          if (typeof v === 'number') return String(v);
          return `'${String(v).replace(/'/g, "\\'")}'`;
        });
        lines.push(`  (${values.join(', ')})${i < rows.length - 1 ? ',' : ';'}`);
      });
      lines.push('');
    });

    return lines.join('\n');
  }

  static generateAdminSeed(tableName: string): string {
    return `-- Default Admin Account Seed
-- Password: 'admin123' (bcrypt hashed below — change before production!)

INSERT IGNORE INTO \`${tableName}\` (name, email, password_hash, role, status, created_at)
VALUES (
  'System Admin',
  'admin@appforge.local',
  '$2b$12$exampleHashChangeBeforeProduction1234567890abcdef',
  'Admin',
  'active',
  CURRENT_TIMESTAMP
);
`;
  }

  // ── FULL SCHEMA ───────────────────────────────────────────────────────────

  static generateFullSchema(appName: string, tables: DatabaseTable[], relationships: AppBlueprint['database']['relationships']): string {
    const lines: string[] = [];
    lines.push(`-- ============================================================`);
    lines.push(`-- ${appName} — Full Database Schema`);
    lines.push(`-- Generated by AppForge SQLCompiler`);
    lines.push(`-- Generated at: ${new Date().toISOString()}`);
    lines.push(`-- ============================================================`);
    lines.push('');
    lines.push('SET NAMES utf8mb4;');
    lines.push('SET FOREIGN_KEY_CHECKS = 0;');
    lines.push('');

    tables.forEach(table => {
      lines.push(SQLCompiler.generateCreateTable(table));
    });

    lines.push('SET FOREIGN_KEY_CHECKS = 1;');
    lines.push('');
    lines.push(`-- Total tables: ${tables.length}`);
    lines.push(`-- Total relationships: ${relationships.length}`);

    return lines.join('\n');
  }
}
