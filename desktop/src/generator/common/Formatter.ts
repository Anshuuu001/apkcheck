export class Formatter {
  /**
   * Cleans code indentation, leading whitespace, and excessive empty lines.
   */
  static clean(code: string): string {
    const lines = code.split('\n');
    let output = '';

    // Simple regex formatting rules
    let currentIndent = 0;
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        output += '\n';
        return;
      }

      // Check closing bracket to reduce indent
      if (trimmed.startsWith('}') || trimmed.startsWith('</') || trimmed.startsWith(')')) {
        currentIndent = Math.max(0, currentIndent - 2);
      }

      output += ' '.repeat(currentIndent) + trimmed + '\n';

      // Check opening bracket to increase indent
      if (trimmed.endsWith('{') || (trimmed.startsWith('<') && !trimmed.endsWith('/>') && !trimmed.startsWith('</') && !trimmed.includes('</'))) {
        currentIndent += 2;
      }
    });

    // Remove duplicates of multiple empty lines
    return output.replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }
}
