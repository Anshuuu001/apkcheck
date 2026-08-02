export class ImportOptimizer {
  /**
   * Deduplicates and sorts import lines in generated files.
   */
  optimize(code: string): string {
    const lines = code.split('\n');
    const importLines: string[] = [];
    const restLines: string[] = [];

    lines.forEach(line => {
      if (line.trim().startsWith('import ')) {
        importLines.push(line);
      } else {
        restLines.push(line);
      }
    });

    // Remove duplicates
    const uniqueImports = Array.from(new Set(importLines));
    
    // Sort imports (putting library imports first)
    uniqueImports.sort((a, b) => {
      const aIsLocal = a.includes('./') || a.includes('../');
      const bIsLocal = b.includes('./') || b.includes('../');
      if (aIsLocal && !bIsLocal) return 1;
      if (!aIsLocal && bIsLocal) return -1;
      return a.localeCompare(b);
    });

    return [...uniqueImports, '', ...restLines].join('\n');
  }
}
