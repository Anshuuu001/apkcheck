import type { AppBlueprint } from '../../../blueprint/schema';

export class BlueprintBrain {
  /**
   * Plans the structural metadata of a blueprint locally.
   */
  planLocalBlueprint(name: string, industry: string, modules: string[]): Partial<AppBlueprint> {
    return {
      name: name,
      industry: industry as any,
      appType: `${industry} App`,
      authRequired: modules.includes('Authentication') || modules.includes('User Profile'),
      users: modules.filter(m => ['Doctor', 'Patient', 'Admin', 'Customer', 'Student', 'Teacher'].includes(m))
    };
  }
}
