import type { DebugFixPlan } from './FixPlanner';

export interface FilePatch {
  filePath: string;
  originalContent: string;
  patchedContent: string;
}

export class PatchGenerator {
  generate(plan: DebugFixPlan, fileContent: string): FilePatch {
    const lines = fileContent.split('\n');
    
    if (plan.action === 'remove-line' && plan.lineNumber <= lines.length) {
      lines.splice(plan.lineNumber - 1, 1);
    } else if (plan.action === 'insert-import') {
      // Stub insert import at the top of file
      lines.unshift(`// Auto-debug resolved import stub`);
    }

    return {
      filePath: plan.filePath,
      originalContent: fileContent,
      patchedContent: lines.join('\n')
    };
  }
}
