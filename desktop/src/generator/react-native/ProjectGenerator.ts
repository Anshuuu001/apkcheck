import type { AppBlueprint } from '../../blueprint/schema';

export class ProjectGenerator {
  static generate(blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};
    
    // Scaffold base configuration files for React Native Expo / Bare project
    files['app.json'] = JSON.stringify({
      expo: {
        name: blueprint.name,
        slug: blueprint.packageName.split('.').pop() || 'app',
        version: blueprint.version,
        orientation: 'portrait',
        icon: './assets/icon.png',
        userInterfaceStyle: blueprint.theme.mode,
        splash: {
          image: './assets/splash.png',
          resizeMode: 'contain',
          backgroundColor: blueprint.theme.colors.background
        },
        ios: {
          supportsTablet: true,
          bundleIdentifier: blueprint.packageName
        },
        android: {
          adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: blueprint.theme.colors.background
          },
          package: blueprint.packageName
        }
      }
    }, null, 2);

    files['tsconfig.json'] = JSON.stringify({
      extends: 'expo/tsconfig.base',
      compilerOptions: {
        strict: true
      }
    }, null, 2);

    files['babel.config.js'] = `module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin']
  };
};`;

    files['metro.config.js'] = `const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
module.exports = config;`;

    return files;
  }
}
