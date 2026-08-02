import type { TestResult } from './BlueprintTester';

export class DependencyChecker {
  /**
   * Scans package dependencies manifest maps
   */
  checkNpmPackage(packageJsonStr: string): TestResult[] {
    const results: TestResult[] = [];

    try {
      const parsed = JSON.parse(packageJsonStr);
      const hasReact = parsed.dependencies && parsed.dependencies.react;
      
      results.push({
        suite: 'Dependency System',
        name: 'React Core Dependency Check',
        passed: !!hasReact,
        message: hasReact ? undefined : 'Missing react dependency in package.json'
      });

      const hasDeps = parsed.dependencies && Object.keys(parsed.dependencies).length > 0;
      results.push({
        suite: 'Dependency System',
        name: 'Dependencies Count Check',
        passed: hasDeps,
        message: hasDeps ? undefined : 'No dependencies defined inside package.json manifest'
      });
    } catch (_e) {
      results.push({
        suite: 'Dependency System',
        name: 'Valid JSON Check',
        passed: false,
        message: 'Failed to parse package.json target content'
      });
    }

    return results;
  }
}
