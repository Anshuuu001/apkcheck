import type { ParsedError } from './CompilerLogReader';

export type ErrorType =
  | 'syntax-error'
  | 'unresolved-import'
  | 'type-mismatch'
  | 'config-failure'
  | 'unknown';

export class ErrorClassifier {
  classify(error: ParsedError): ErrorType {
    const msg = error.message.toLowerCase();

    if (msg.includes('cannot find name') || msg.includes('does not exist')) {
      return 'type-mismatch';
    }
    if (msg.includes('cannot find module') || msg.includes('could not resolve')) {
      return 'unresolved-import';
    }
    if (msg.includes('unexpected token') || msg.includes('syntax error')) {
      return 'syntax-error';
    }
    if (msg.includes('json') || msg.includes('config')) {
      return 'config-failure';
    }

    return 'unknown';
  }
}
