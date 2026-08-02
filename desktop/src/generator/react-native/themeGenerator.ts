import type { ThemeTokens } from '../../blueprint/schema';

export function generateThemeRN(theme: ThemeTokens): string {
  return `
export const theme = {
  mode: ${JSON.stringify(theme.mode)},
  colors: {
    primary: ${JSON.stringify(theme.colors.primary)},
    primaryLight: ${JSON.stringify(theme.colors.primaryLight)},
    primaryDark: ${JSON.stringify(theme.colors.primaryDark)},
    secondary: ${JSON.stringify(theme.colors.secondary)},
    secondaryLight: ${JSON.stringify(theme.colors.secondaryLight)},
    accent: ${JSON.stringify(theme.colors.accent)},
    background: ${JSON.stringify(theme.colors.background)},
    surface: ${JSON.stringify(theme.colors.surface)},
    surfaceVariant: ${JSON.stringify(theme.colors.surfaceVariant)},
    onPrimary: ${JSON.stringify(theme.colors.onPrimary)},
    onSecondary: ${JSON.stringify(theme.colors.onSecondary)},
    onBackground: ${JSON.stringify(theme.colors.onBackground)},
    onSurface: ${JSON.stringify(theme.colors.onSurface)},
    error: ${JSON.stringify(theme.colors.error)},
    success: ${JSON.stringify(theme.colors.success)},
    warning: ${JSON.stringify(theme.colors.warning)},
    info: ${JSON.stringify(theme.colors.info)},
    divider: ${JSON.stringify(theme.colors.divider)},
    shadow: ${JSON.stringify(theme.colors.shadow)},
  },
  typography: {
    fontFamily: ${JSON.stringify(theme.typography.fontFamily)},
    scale: ${JSON.stringify(theme.typography.scale)},
  },
  spacing: ${JSON.stringify(theme.spacing)},
  borderRadius: ${JSON.stringify(theme.borderRadius)},
  elevation: ${JSON.stringify(theme.elevation)},
};
`.trim();
}
