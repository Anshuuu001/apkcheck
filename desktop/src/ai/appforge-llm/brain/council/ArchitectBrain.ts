import { CouncilBrain, type CouncilReviewResult } from './CouncilBrain';
import type { AppBlueprint } from '../../../../blueprint/schema';

export class ArchitectBrain extends CouncilBrain {
  roleName = 'Architect';

  async review(blueprint: AppBlueprint): Promise<CouncilReviewResult> {
    const comments: string[] = [];
    const tables = blueprint.database.tables;

    if (tables.length === 0) {
      comments.push('Architect Review: Database tables list is empty.');
    } else {
      comments.push(`Architect Review: Confirmed database layout containing ${tables.length} tables.`);
    }

    // Verify foreign keys mapping
    const tableNames = new Set(tables.map(t => t.name));
    tables.forEach(t => {
      if (t.foreignKeys) {
        t.foreignKeys.forEach(fk => {
          if (!tableNames.has(fk.referencesTable)) {
            comments.push(`Architect Review Error: Foreign key in "${t.name}" references undefined table "${fk.referencesTable}"`);
          }
        });
      }
    });

    return {
      approved: !comments.some(c => c.includes('Error')),
      comments
    };
  }
}
