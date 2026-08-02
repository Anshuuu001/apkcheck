import type { AppBlueprint } from '../../blueprint/schema';

export class EnvironmentGenerator {
  static generate(blueprint: AppBlueprint): string {
    const envLines: string[] = [
      `# Generated environment parameters for ${blueprint.name}`,
      `EXPO_PUBLIC_API_URL=${blueprint.api.baseUrl}`,
      `EXPO_PUBLIC_API_VERSION=${blueprint.api.version}`,
      `EXPO_PUBLIC_APP_PLATFORM=react-native`,
      `EXPO_PUBLIC_AUTH_SCHEME=${blueprint.api.authScheme}`
    ];

    if (blueprint.requirementAnswers?.paymentRequired) {
      envLines.push(`EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_appforge_mock_51`);
    }

    return envLines.join('\n');
  }
}
