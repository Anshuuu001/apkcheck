import type { AppBlueprint } from '../blueprint/schema';
import { ReactCompiler } from './ReactCompiler';
import { SpringCompiler } from './SpringCompiler';
import { SQLCompiler } from './SQLCompiler';
import { ThemeCompiler } from './ThemeCompiler';
import { NavigationCompiler } from './NavigationCompiler';
import { AssetCompiler } from './AssetCompiler';

export interface CompilationOutput {
  reactNativeFiles: Record<string, string>;
  springBootFiles: Record<string, string>;
  sqlSchema: string;
  themeConfig: string;
  navigationConfig: string;
  assetConfig: string;
}

export class BlueprintCompiler {
  /**
   * Compiles the entire AppBlueprint into deterministic source code files maps
   */
  compile(blueprint: AppBlueprint): CompilationOutput {
    console.log(`[BlueprintCompiler] Compiling project "${blueprint.name}"...`);

    const reactNativeFiles = ReactCompiler.compile(blueprint.screens);
    const springBootFiles = SpringCompiler.compile(blueprint.api);
    const sqlSchema = SQLCompiler.compile(blueprint.database);
    const themeConfig = ThemeCompiler.compile(blueprint.theme);
    const navigationConfig = NavigationCompiler.compile(blueprint.navigation);
    const assetConfig = AssetCompiler.compile(blueprint.icon);

    console.log(`[BlueprintCompiler] Compilation successful. Compiled ${Object.keys(reactNativeFiles).length} React components and ${Object.keys(springBootFiles).length} Spring routes.`);

    return {
      reactNativeFiles,
      springBootFiles,
      sqlSchema,
      themeConfig,
      navigationConfig,
      assetConfig
    };
  }
}
