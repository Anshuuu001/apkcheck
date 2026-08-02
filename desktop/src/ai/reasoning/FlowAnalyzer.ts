export interface FlowDependency {
  module: string;
  dependsOn: string;
  resolved: boolean;
}

export class FlowAnalyzer {
  /**
   * Evaluates feature cross-dependencies and checks if they are satisfied.
   */
  checkDependencies(features: string[]): FlowDependency[] {
    const dependencies: FlowDependency[] = [
      { module: 'checkout', dependsOn: 'cart', resolved: false },
      { module: 'billing', dependsOn: 'checkout', resolved: false },
      { module: 'teleconsult', dependsOn: 'auth', resolved: false },
      { module: 'gps_tracking', dependsOn: 'location', resolved: false },
    ];

    return dependencies.map(dep => {
      // Check if both elements are in the features list
      const hasModule = features.some(f => f.toLowerCase().includes(dep.module));
      const hasDependency = features.some(f => f.toLowerCase().includes(dep.dependsOn)) || 
                            (dep.dependsOn === 'auth' && features.includes('auth')) || // general auth check
                            (dep.dependsOn === 'location' && features.includes('locationRequired')); // general location check

      return {
        ...dep,
        resolved: !hasModule || hasDependency
      };
    });
  }
}
