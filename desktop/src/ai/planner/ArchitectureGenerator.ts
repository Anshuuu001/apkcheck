import type { ArchitectureDecision, RequirementDocument } from '../../blueprint/schema';

export class ArchitectureGenerator {
  plan(reqDoc: RequirementDocument): ArchitectureDecision {
    // Determine the tech stack based on industry and requirement flags
    const hasComplexState = reqDoc.modules.length > 3 || reqDoc.functionalRequirements.some(r => r.toLowerCase().includes('billing') || r.toLowerCase().includes('cart'));
    const isMobileFirst = true; // default AppForge architecture

    const frontendFramework = isMobileFirst ? 'React Native' : 'React (Vite)';
    const stateManagement = hasComplexState ? 'Redux (Toolkit)' : 'Zustand';
    const navigationLibrary = isMobileFirst ? 'React Navigation (Native Stack & Tabs)' : 'React Router DOM';
    const httpClient = 'Axios';
    const backendFramework = 'Spring Boot 3.x (Java 17)';
    const authScheme = reqDoc.functionalRequirements.some(r => r.toLowerCase().includes('auth') || r.toLowerCase().includes('login')) ? 'JWT (JSON Web Token)' : 'None';
    
    // Choose database based on requirements
    const databaseType = reqDoc.constraints.some(c => c.toLowerCase().includes('sqlite')) ? 'SQLite' : 'MySQL';

    return {
      frontendFramework,
      stateManagement,
      navigationLibrary,
      httpClient,
      backendFramework,
      authScheme,
      databaseType
    };
  }
}
