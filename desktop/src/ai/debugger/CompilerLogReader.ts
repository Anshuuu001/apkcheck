export interface ParsedError {
  filePath: string;
  lineNumber: number;
  message: string;
  raw: string;
}

export class CompilerLogReader {
  /**
   * Scans compilation error output strings for warnings/errors
   */
  read(log: string): ParsedError[] {
    const errors: ParsedError[] = [];
    const lines = log.split('\n');

    // Simple regex matching for common TS compilation or linting logs
    // e.g., "src/components/Button.tsx:12:35 - error TS2304: Cannot find name 'x'."
    const tsErrorRegex = /([a-zA-Z0-9_\-\.\/]+):(\d+):(\d+)\s*-\s*error\s*(.+)/;

    lines.forEach(line => {
      const match = tsErrorRegex.exec(line);
      if (match) {
        errors.push({
          filePath: match[1],
          lineNumber: parseInt(match[2], 10),
          message: match[4].trim(),
          raw: line
        });
      }
    });

    return errors;
  }
}
