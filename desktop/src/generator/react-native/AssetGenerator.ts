import type { AppBlueprint } from '../../blueprint/schema';

export class AssetGenerator {
  static generate(blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};

    files['src/assets/manifest.json'] = JSON.stringify({
      appName: blueprint.name,
      platform: blueprint.buildConfig?.targetSdkVersion ? 'android' : 'universal',
      fonts: [
        { name: 'Inter-Regular', style: 'normal', weight: 400 },
        { name: 'Inter-SemiBold', style: 'normal', weight: 600 },
        { name: 'Inter-Bold', style: 'normal', weight: 700 }
      ],
      images: [
        { id: 'logo', description: 'App branding logo' },
        { id: 'avatar_placeholder', description: 'Fallback user profile avatar image' }
      ]
    }, null, 2);

    return files;
  }
}
