import type { RequirementDocument, RequirementAnswers } from '../../blueprint/schema';

export class RequirementDocumentGenerator {
  generate(idea: string, industry: string, answers: RequirementAnswers): RequirementDocument {
    const functionalRequirements: string[] = [
      `The system must support the core operations of a ${industry} application.`,
      `Users must be able to perform search queries across resources.`
    ];

    if (answers.authRequired) {
      functionalRequirements.push('The system must provide user signup, email verification, and secure credentials login.');
      functionalRequirements.push('Users must be able to view and manage their personal accounts and authentication sessions.');
    }

    if (answers.paymentRequired) {
      functionalRequirements.push('The system must integrate secure billing checkout flows and maintain purchase receipts.');
    }

    if (answers.locationRequired) {
      functionalRequirements.push('The application must obtain location permissions and coordinate live GPS coordinates tracking.');
    }

    if (answers.notificationsRequired) {
      functionalRequirements.push('The system must allow push notification subscriptions and trigger alert logs.');
    }

    // Dynamic features list
    if (answers.features && answers.features.length > 0) {
      answers.features.forEach(feat => {
        functionalRequirements.push(`Implement the ${feat} feature flow with active interactive controls.`);
      });
    }

    const nonFunctionalRequirements: string[] = [
      'Performance: API endpoints should execute in under 200ms using caching techniques.',
      'Security: User passwords must be hashed using bcrypt, and API traffic must use JWT encryption.',
      'Compatibility: Mobile layouts must adapt natively across Android/iOS devices.',
      `UX Layouts: Colors and typography should respect the user-chosen default theme mode.`
    ];

    const constraints: string[] = [
      'Platform: Run under Java 17 / Spring Boot 3 framework backend and React Native frontend.',
      `Storage Constraints: Use a SQLite local db client or standard MySQL instance.`,
      `Locale: Default application UI languages configured for: ${answers.supportedLanguages ? answers.supportedLanguages.join(', ') : 'en'}.`
    ];

    const businessRules: string[] = [
      'Authenticated Access Only: Access-restricted dashboard views must guard against unauthenticated visitors.',
      'Role Validation: Certain endpoints (e.g., admin dashboard) are restricted strictly to specialized authorized users.',
      'Notification Auditing: All triggered critical notifications must be tracked and logged.'
    ];

    return {
      functionalRequirements,
      nonFunctionalRequirements,
      userRoles: answers.userRoles.length > 0 ? answers.userRoles : ['User', 'Admin'],
      modules: answers.features && answers.features.length > 0 ? answers.features : ['Dashboard', 'Profile'],
      constraints,
      businessRules
    };
  }
}
