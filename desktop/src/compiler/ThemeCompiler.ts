import type { ThemeTokens } from '../blueprint/schema';
import { ThemeRegistry } from '../registry/ThemeRegistry';

export class ThemeCompiler {
  static compile(theme: ThemeTokens): string {
    return ThemeRegistry.compile(theme);
  }
}
