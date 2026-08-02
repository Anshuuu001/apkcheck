import type { ThemeTokens, IndustryType, ColorPalette } from '../../blueprint/schema';
import { generateTheme } from '../planner/ThemePlanner';

export function buildTheme(industry: IndustryType, mode: 'light' | 'dark' = 'dark', overrides?: Partial<ColorPalette>): ThemeTokens {
  return generateTheme(industry, mode, overrides);
}
