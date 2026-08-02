import type { AppBlueprint } from '../blueprint/schema';

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  message?: string;
}

export class BlueprintTester {
  test(blueprint: AppBlueprint): TestResult[] {
    const results: TestResult[] = [];

    // Test 1: Minimum screens check
    results.push({
      suite: 'Blueprint',
      name: 'Screens Count Check',
      passed: blueprint.screens.length > 0,
      message: blueprint.screens.length > 0 ? undefined : 'Blueprint has 0 screens'
    });

    // Test 2: Theme tokens exists
    results.push({
      suite: 'Blueprint',
      name: 'Theme Validation',
      passed: !!blueprint.theme && !!blueprint.theme.colors && !!blueprint.theme.typography,
      message: !!blueprint.theme ? undefined : 'Missing theme config definitions'
    });

    // Test 3: Route definition completeness
    const missingRoutes = blueprint.screens.filter(s => !s.route);
    results.push({
      suite: 'Blueprint',
      name: 'Routes Completeness',
      passed: missingRoutes.length === 0,
      message: missingRoutes.length === 0 ? undefined : `Screens with missing routes: ${missingRoutes.map(s => s.name).join(', ')}`
    });

    return results;
  }
}
