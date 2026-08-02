import type { DatabasePlan } from '../blueprint/schema';

export class SQLCompiler {
  static compile(plan: DatabasePlan): string {
    let sql = `-- AppForge SQL Compiler Output\n-- Target Database: ${plan.dbType || 'MySQL'}\n\n`;
    
    plan.tables.forEach(table => {
      sql += `CREATE TABLE \`${table.name}\` (\n`;
      const colDefinitions = table.columns.map(col => {
        let def = `  \`${col.name}\` ${col.type.toUpperCase()}`;
        if (col.primaryKey) def += ' PRIMARY KEY AUTO_INCREMENT';
        if (!col.nullable) def += ' NOT NULL';
        return def;
      });
      sql += colDefinitions.join(',\n');
      
      if (table.foreignKeys && table.foreignKeys.length > 0) {
        table.foreignKeys.forEach(fk => {
          sql += `,\n  FOREIGN KEY (\`${fk.column}\`) REFERENCES \`${fk.referencesTable}\`(\`id\`)`;
        });
      }
      sql += '\n);\n\n';
    });

    return sql;
  }
}
