import type { TestResult } from './BlueprintTester';

export class CodeTester {
  /**
   * Asserts code layout format and component definitions are correctly written
   */
  testGeneratedComponent(name: string, content: string): TestResult[] {
    const results: TestResult[] = [];

    // Test 1: Check for basic export keyword
    const hasExport = content.includes('export const') || content.includes('export default') || content.includes('export class');
    results.push({
      suite: 'Code Generation',
      name: `${name} Export Check`,
      passed: hasExport,
      message: hasExport ? undefined : 'Component has no exported components or handlers'
    });

    // Test 2: Check for unclosed syntax elements
    const bracesMatch = (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length;
    results.push({
      suite: 'Code Generation',
      name: `${name} Curly Braces Match`,
      passed: bracesMatch,
      message: bracesMatch ? undefined : 'Mismatched curly braces in generated source'
    });

    return results;
  }
}
