import type { ParsedError } from './CompilerLogReader';
import type { ErrorType } from './ErrorClassifier';

export interface DebugFixPlan {
  action: 'insert-import' | 'remove-line' | 'fix-syntax' | 'regenerate' | 'known-fix';
  filePath: string;
  lineNumber: number;
  suggestion: string;
  knownFixData?: string;  // Raw fix data from Build Memory DB
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

  /**
   * Build Memory path: create a fix plan from a stored known-fix string.
   * Called when learningDb.findBuildFix() returns a hit.
   */
  planFromFix(error: ParsedError, knownFix: string): DebugFixPlan {
    // Try to parse as a stored DebugFixPlan JSON first
    try {
      const parsed: DebugFixPlan = JSON.parse(knownFix);
      return { ...parsed, knownFixData: knownFix };
    } catch {
      // Fallback: treat as a text suggestion
      return {
        action: 'known-fix',
        filePath: error.filePath,
        lineNumber: error.lineNumber,
        suggestion: knownFix,
        knownFixData: knownFix,
      };
    }
  }
}

