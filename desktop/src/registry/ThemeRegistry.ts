import type { ThemeTokens } from '../blueprint/schema';

export class ThemeRegistry {
  static compile(theme: ThemeTokens): string {
    return `
export const AppTheme = {
  dark: ${theme.mode === 'dark'},
  colors: {
    primary: '${theme.colors?.primary || '#3b82f6'}',
    background: '${theme.colors?.background || '#f8fafc'}',
    card: '${theme.colors?.surface || '#ffffff'}',
    text: '${theme.colors?.onBackground || '#0f172a'}',
    border: '${theme.colors?.divider || '#cbd5e1'}',
    notification: '${theme.colors?.accent || '#f59e0b'}',
  }
};
`;
  }
}
