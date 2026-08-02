import type { AppBlueprint } from '../../blueprint/schema';
import { generateThemeRN } from './themeGenerator';
import { generateScreenRN } from './screenGenerator';
import { generateNavigationRN } from './navigationGenerator';

export interface CodeAssetFile {
  path: string;
  content: string;
}

/**
 * Reads an AppBlueprint and produces all react native codebase files.
 */
export function generateReactNativeProject(blueprint: AppBlueprint): CodeAssetFile[] {
  const files: CodeAssetFile[] = [];

  // 1. Add theme
  files.push({
    path: 'src/theme/theme.ts',
    content: generateThemeRN(blueprint.theme),
  });

  // 2. Add navigation
  files.push({
    path: 'src/navigation/AppNavigator.tsx',
    content: generateNavigationRN(blueprint.screens, blueprint.navigation),
  });

  // 3. Add screens
  blueprint.screens.forEach(screen => {
    files.push({
      path: `src/screens/${screen.name}.tsx`,
      content: generateScreenRN(screen),
    });
  });

  // 4. Add Entry point App.tsx
  files.push({
    path: 'App.tsx',
    content: `
import React from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
}
`.trim(),
  });

  // 5. Add package.json stub
  files.push({
    path: 'package.json',
    content: JSON.stringify({
      name: blueprint.packageName.split('.').pop() || 'app',
      version: blueprint.version,
      private: true,
      scripts: {
        "start": "expo start",
        "android": "expo start --android",
        "ios": "expo start --ios",
        "web": "expo start --web"
      },
      dependencies: {
        "expo": "~51.0.0",
        "react": "18.2.0",
        "react-native": "0.74.1",
        "@react-navigation/native": "^6.1.17",
        "@react-navigation/stack": "^6.3.29",
        "@react-navigation/bottom-tabs": "^6.5.20",
        "react-native-safe-area-context": "4.10.1",
        "react-native-screens": "~3.31.1"
      }
    }, null, 2),
  });

  return files;
}
