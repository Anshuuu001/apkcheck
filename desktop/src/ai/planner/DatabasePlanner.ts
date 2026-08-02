/**
 * AppForge-AI — Database Planner V2
 * 
 * Compiles relational table columns, data types, indexes, and primary/foreign keys.
 */

import type { PipelineContext } from '../orchestrator/Context';
import type { DatabasePlan, TableRelationship } from '../../blueprint/schema';
import { buildDatabase } from '../blueprint/databaseGenerator';

export class DatabasePlanner {
  async plan(context: PipelineContext): Promise<DatabasePlan> {
    const intent = context.getIntent();
    const answers = context.getAnswers();

    if (!intent || !answers) {
      throw new Error('DatabasePlanner requires intent and answers in context');
    }

    const allFeatures = [...answers.features];
    if (answers.notificationsRequired) allFeatures.push('notifications');
    if (answers.locationRequired) allFeatures.push('gps_tracking');
    if (answers.paymentRequired) allFeatures.push('billing');

    const users = answers.userRoles.length > 0 ? answers.userRoles : intent.targetUsers;
    const tables = buildDatabase(allFeatures, users, answers.authRequired, intent.industry);

    // Derive relationships dynamically based on tables and fields present
    const relationships: TableRelationship[] = [];
    tables.forEach(table => {
      if (table.foreignKeys && table.foreignKeys.length > 0) {
        table.foreignKeys.forEach(fk => {
          relationships.push({
            from: table.name,
            to: fk.referencesTable,
            type: 'ONE_TO_MANY',
            label: `${table.name}_references_${fk.referencesTable}`
          });
        });
      }
    });

    return {
      dbType: 'mysql',
      tables,
      relationships,
    };
  }
}
