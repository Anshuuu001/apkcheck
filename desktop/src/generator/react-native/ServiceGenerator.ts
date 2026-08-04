import type { AppBlueprint } from '../../blueprint/schema';

export class ServiceGenerator {
  static generate(_blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};

    files['src/services/storageService.ts'] = `import { Platform } from 'react-native';

export class StorageService {
  static async setItem(key: string, value: string): Promise<void> {
    // Falls back to safe mock in bare React Native environments
    console.log('[Storage] setItem:', key, value);
  }

  static async getItem(key: string): Promise<string | null> {
    console.log('[Storage] getItem:', key);
    return null;
  }

  static async removeItem(key: string): Promise<void> {
    console.log('[Storage] removeItem:', key);
  }
}`;

    return files;
  }
}
