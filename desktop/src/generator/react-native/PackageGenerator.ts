import type { AppBlueprint } from '../../blueprint/schema';

export class PackageGenerator {
  static generate(blueprint: AppBlueprint): string {
    const dependencies: Record<string, string> = {
      "expo": "~52.0.0",
      "expo-status-bar": "~2.0.0",
      "react": "18.3.1",
      "react-native": "0.76.0",
      "react-native-safe-area-context": "4.12.0",
      "react-native-screens": "~4.0.0",
      "@react-navigation/native": "^6.1.17",
      "@react-navigation/native-stack": "^6.9.26",
      "@react-navigation/bottom-tabs": "^6.5.20",
      "@react-navigation/drawer": "^6.6.15",
      "react-native-gesture-handler": "~2.20.0",
      "react-native-reanimated": "~3.16.0",
      "lucide-react-native": "^0.400.0",
      "zustand": "^5.0.0"
    };

    // Include payment support if paymentRequired
    if (blueprint.requirementAnswers?.paymentRequired) {
      dependencies["@stripe/stripe-react-native"] = "0.38.0";
    }

    // Include maps support if locationRequired
    if (blueprint.requirementAnswers?.locationRequired) {
      dependencies["react-native-maps"] = "1.18.0";
    }

    const packageJson = {
      name: blueprint.packageName.split('.').pop() || 'appforge-app',
      version: blueprint.version,
      scripts: {
        "start": "expo start",
        "android": "expo start --android",
        "ios": "expo start --ios",
        "web": "expo start --web"
      },
      dependencies,
      devDependencies: {
        "@babel/core": "^7.20.0",
        "@types/react": "~18.3.0",
        "typescript": "^5.3.3"
      },
      private: true
    };

    return JSON.stringify(packageJson, null, 2);
  }
}
