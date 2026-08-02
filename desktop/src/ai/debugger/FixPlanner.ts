import type { ParsedError } from './CompilerLogReader';
import type { ErrorType } from './ErrorClassifier';

export interface DebugFixPlan {
  action: 'insert-import' | 'remove-line' | 'fix-syntax' | 'regenerate';
  filePath: string;
  lineNumber: number;
  suggestion: string;
}

export class FixPlanner {
  plan(error: ParsedError, type: ErrorType): DebugFixPlan {
    switch (type) {
      case 'unresolved-import':
        return {
          action: 'insert-import',
          filePath: error.filePath,
          lineNumber: error.lineNumber,
          suggestion: `Verify if import paths need adjusting inside ${error.filePath}.`
        };
      case 'type-mismatch':
        return {
          action: 'fix-syntax',
          filePath: error.filePath,
          lineNumber: error.lineNumber,
          suggestion: `Add fallback default declarations or type casts.`
        };
      case 'syntax-error':
      default:
        return {
          action: 'regenerate',
          filePath: error.filePath,
          lineNumber: error.lineNumber,
          suggestion: `Regenerate standard component skeleton boilerplate.`
        };
    }
  }
}
