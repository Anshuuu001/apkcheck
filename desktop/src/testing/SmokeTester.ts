import type { AppBlueprint } from '../blueprint/schema';
import type { TestResult } from './BlueprintTester';

export class SmokeTester {
  /**
   * Performs quick app structure validation checks
   */
  smokeTestApp(blueprint: AppBlueprint): TestResult[] {
    const results: TestResult[] = [];

    // Verify home route exists in navigation configuration routes
    const homeScreen = blueprint.screens.find(s => s.type === 'home' || s.route === 'Shop' || s.route === 'Dashboard');
    results.push({
      suite: 'Smoke Test',
      name: 'Initial Screen Mount Test',
      passed: !!homeScreen,
      message: homeScreen ? undefined : 'No entrypoint screen found to mount initial boot view'
    });

    return results;
  }
}
