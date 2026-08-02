/**
 * AppForge-AI — Theme Planner (Stage 5)
 * 
 * Generates industry-aware design token sets.
 * Never uses random colors — always follows industry conventions and best practices.
 */

import type { ThemeTokens, ColorPalette, IndustryType } from '../../blueprint/schema';
import { DEFAULT_TYPOGRAPHY, DEFAULT_SPACING, DEFAULT_RADIUS, DEFAULT_ELEVATION } from '../../blueprint/parser';

// ─── Industry Color Palettes ──────────────────────────────────────────────────

const INDUSTRY_PALETTES: Record<IndustryType, { dark: ColorPalette; light: ColorPalette; name: string }> = {
  'Healthcare': {
    name: 'Medical Blue',
    dark: {
      primary: '#2196F3', primaryLight: '#64B5F6', primaryDark: '#1565C0',
      secondary: '#26C6DA', secondaryLight: '#80DEEA', accent: '#00E5FF',
      background: '#0A1628', surface: '#0D1F3C', surfaceVariant: '#132850',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#E3F2FD', onSurface: '#BBDEFB',
      error: '#F44336', success: '#4CAF50', warning: '#FFC107', info: '#2196F3',
      divider: '#1A3050', shadow: 'rgba(0,0,0,0.5)',
    },
    light: {
      primary: '#1976D2', primaryLight: '#42A5F5', primaryDark: '#0D47A1',
      secondary: '#0097A7', secondaryLight: '#4DB6AC', accent: '#00BCD4',
      background: '#F5F9FF', surface: '#FFFFFF', surfaceVariant: '#E3F2FD',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#0D1928', onSurface: '#1A237E',
      error: '#D32F2F', success: '#388E3C', warning: '#F57C00', info: '#1976D2',
      divider: '#BBDEFB', shadow: 'rgba(21,101,192,0.15)',
    },
  },

  'Education': {
    name: 'Scholar Purple',
    dark: {
      primary: '#7C4DFF', primaryLight: '#B388FF', primaryDark: '#4527A0',
      secondary: '#FF6D00', secondaryLight: '#FFAB40', accent: '#FFD740',
      background: '#0E0A1F', surface: '#160E30', surfaceVariant: '#1E1540',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#EDE7F6', onSurface: '#D1C4E9',
      error: '#EF5350', success: '#66BB6A', warning: '#FFA726', info: '#42A5F5',
      divider: '#2A1F50', shadow: 'rgba(0,0,0,0.5)',
    },
    light: {
      primary: '#5E35B1', primaryLight: '#9575CD', primaryDark: '#311B92',
      secondary: '#E65100', secondaryLight: '#FF8F00', accent: '#FFC400',
      background: '#F8F5FF', surface: '#FFFFFF', surfaceVariant: '#EDE7F6',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#120A2E', onSurface: '#311B92',
      error: '#C62828', success: '#2E7D32', warning: '#E65100', info: '#1565C0',
      divider: '#D1C4E9', shadow: 'rgba(94,53,177,0.15)',
    },
  },

  'E-Commerce': {
    name: 'Commerce Orange',
    dark: {
      primary: '#FF6B35', primaryLight: '#FF8C5A', primaryDark: '#C94B1C',
      secondary: '#FFC107', secondaryLight: '#FFD54F', accent: '#FFEB3B',
      background: '#0F0A06', surface: '#1A1209', surfaceVariant: '#251A0E',
      onPrimary: '#FFFFFF', onSecondary: '#1A0A00', onBackground: '#FFF3E0', onSurface: '#FFE0B2',
      error: '#F44336', success: '#4CAF50', warning: '#FF9800', info: '#03A9F4',
      divider: '#2A1A0A', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#E64A19', primaryLight: '#FF7043', primaryDark: '#BF360C',
      secondary: '#F9A825', secondaryLight: '#FBC02D', accent: '#F57F17',
      background: '#FFFBF7', surface: '#FFFFFF', surfaceVariant: '#FFF3E0',
      onPrimary: '#FFFFFF', onSecondary: '#1A0A00', onBackground: '#1A0A00', onSurface: '#3E2723',
      error: '#C62828', success: '#2E7D32', warning: '#E65100', info: '#0277BD',
      divider: '#FFCCBC', shadow: 'rgba(230,74,25,0.15)',
    },
  },

  'Food & Delivery': {
    name: 'Spice Red',
    dark: {
      primary: '#FF3D00', primaryLight: '#FF6D3B', primaryDark: '#BF2000',
      secondary: '#FF8F00', secondaryLight: '#FFCA28', accent: '#76FF03',
      background: '#0F0800', surface: '#1A1000', surfaceVariant: '#251800',
      onPrimary: '#FFFFFF', onSecondary: '#1A0800', onBackground: '#FFF8E1', onSurface: '#FFE57F',
      error: '#F44336', success: '#69F0AE', warning: '#FFD740', info: '#40C4FF',
      divider: '#2A1800', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#DD2C00', primaryLight: '#FF3D00', primaryDark: '#BF360C',
      secondary: '#E65100', secondaryLight: '#FF6D00', accent: '#558B2F',
      background: '#FFFDF7', surface: '#FFFFFF', surfaceVariant: '#FFF3E0',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#1A0800', onSurface: '#3E2723',
      error: '#B71C1C', success: '#1B5E20', warning: '#E65100', info: '#0277BD',
      divider: '#FFCCBC', shadow: 'rgba(221,44,0,0.15)',
    },
  },

  'Transportation': {
    name: 'Night Rider',
    dark: {
      primary: '#00E5FF', primaryLight: '#80FFFF', primaryDark: '#00B2CC',
      secondary: '#76FF03', secondaryLight: '#CCFF90', accent: '#FFEA00',
      background: '#050A0F', surface: '#0A1520', surfaceVariant: '#0F1E2E',
      onPrimary: '#000000', onSecondary: '#000000', onBackground: '#E0F7FA', onSurface: '#B2EBF2',
      error: '#FF1744', success: '#00E676', warning: '#FFEA00', info: '#00B0FF',
      divider: '#0F2030', shadow: 'rgba(0,0,0,0.7)',
    },
    light: {
      primary: '#0097A7', primaryLight: '#00BCD4', primaryDark: '#006064',
      secondary: '#33691E', secondaryLight: '#558B2F', accent: '#F57F17',
      background: '#F5FEFF', surface: '#FFFFFF', surfaceVariant: '#E0F7FA',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#00363A', onSurface: '#004D40',
      error: '#B71C1C', success: '#1B5E20', warning: '#E65100', info: '#006064',
      divider: '#B2EBF2', shadow: 'rgba(0,151,167,0.15)',
    },
  },

  'Finance & Banking': {
    name: 'Vault Green',
    dark: {
      primary: '#00C853', primaryLight: '#69F0AE', primaryDark: '#009624',
      secondary: '#00B8D4', secondaryLight: '#62EFFF', accent: '#FFD600',
      background: '#020F08', surface: '#041A0E', surfaceVariant: '#082415',
      onPrimary: '#000000', onSecondary: '#000000', onBackground: '#E8F5E9', onSurface: '#C8E6C9',
      error: '#FF5252', success: '#00C853', warning: '#FFD600', info: '#00B8D4',
      divider: '#0F2E18', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#1B5E20', primaryLight: '#388E3C', primaryDark: '#0A280D',
      secondary: '#006064', secondaryLight: '#00838F', accent: '#F9A825',
      background: '#F5FFF7', surface: '#FFFFFF', surfaceVariant: '#E8F5E9',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#0A1F0D', onSurface: '#1B5E20',
      error: '#B71C1C', success: '#1B5E20', warning: '#E65100', info: '#006064',
      divider: '#C8E6C9', shadow: 'rgba(27,94,32,0.15)',
    },
  },

  'Real Estate': {
    name: 'Property Gold',
    dark: {
      primary: '#C8A96E', primaryLight: '#E8C98E', primaryDark: '#8D7248',
      secondary: '#546E7A', secondaryLight: '#78909C', accent: '#80CBC4',
      background: '#0C0A06', surface: '#18140C', surfaceVariant: '#241E10',
      onPrimary: '#0C0A06', onSecondary: '#FFFFFF', onBackground: '#FFF8E1', onSurface: '#EFEBE9',
      error: '#FF5252', success: '#69F0AE', warning: '#FFD740', info: '#40C4FF',
      divider: '#2A2414', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#795548', primaryLight: '#A1887F', primaryDark: '#4E342E',
      secondary: '#455A64', secondaryLight: '#607D8B', accent: '#009688',
      background: '#FDFAF5', surface: '#FFFFFF', surfaceVariant: '#EFEBE9',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#1A1208', onSurface: '#3E2723',
      error: '#C62828', success: '#2E7D32', warning: '#E65100', info: '#0277BD',
      divider: '#D7CCC8', shadow: 'rgba(121,85,72,0.15)',
    },
  },

  'Social Media': {
    name: 'Gradient Glow',
    dark: {
      primary: '#E040FB', primaryLight: '#EA80FC', primaryDark: '#AA00FF',
      secondary: '#FF4081', secondaryLight: '#FF80AB', accent: '#40C4FF',
      background: '#0A0414', surface: '#130820', surfaceVariant: '#1C0D2E',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#F3E5F5', onSurface: '#E1BEE7',
      error: '#FF5252', success: '#69F0AE', warning: '#FFD740', info: '#40C4FF',
      divider: '#200B30', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#9C27B0', primaryLight: '#CE93D8', primaryDark: '#6A0080',
      secondary: '#E91E63', secondaryLight: '#F48FB1', accent: '#03A9F4',
      background: '#FDF5FF', surface: '#FFFFFF', surfaceVariant: '#F3E5F5',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#1A0020', onSurface: '#4A148C',
      error: '#C62828', success: '#2E7D32', warning: '#E65100', info: '#0277BD',
      divider: '#E1BEE7', shadow: 'rgba(156,39,176,0.15)',
    },
  },

  'Fitness & Health': {
    name: 'Energy Orange',
    dark: {
      primary: '#FF6F00', primaryLight: '#FFA040', primaryDark: '#C24400',
      secondary: '#00E5FF', secondaryLight: '#62FFFF', accent: '#76FF03',
      background: '#0F0800', surface: '#1A1200', surfaceVariant: '#251A00',
      onPrimary: '#FFFFFF', onSecondary: '#000000', onBackground: '#FFF8E1', onSurface: '#FFECB3',
      error: '#FF1744', success: '#00E676', warning: '#FF9100', info: '#00B0FF',
      divider: '#2A1A00', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#E65100', primaryLight: '#FF6D00', primaryDark: '#BF360C',
      secondary: '#0097A7', secondaryLight: '#00BCD4', accent: '#558B2F',
      background: '#FFFBF2', surface: '#FFFFFF', surfaceVariant: '#FFF3E0',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#1A0800', onSurface: '#BF360C',
      error: '#B71C1C', success: '#1B5E20', warning: '#E65100', info: '#0277BD',
      divider: '#FFE0B2', shadow: 'rgba(230,81,0,0.15)',
    },
  },

  'Entertainment': {
    name: 'Neon Night',
    dark: {
      primary: '#E91E63', primaryLight: '#F06292', primaryDark: '#880E4F',
      secondary: '#FF6D00', secondaryLight: '#FF9E40', accent: '#FFEA00',
      background: '#080008', surface: '#110014', surfaceVariant: '#1A001F',
      onPrimary: '#FFFFFF', onSecondary: '#1A0800', onBackground: '#FCE4EC', onSurface: '#F8BBD9',
      error: '#FF1744', success: '#00E676', warning: '#FFEA00', info: '#00B0FF',
      divider: '#1E001A', shadow: 'rgba(0,0,0,0.7)',
    },
    light: {
      primary: '#AD1457', primaryLight: '#E91E63', primaryDark: '#880E4F',
      secondary: '#E64A19', secondaryLight: '#FF7043', accent: '#F9A825',
      background: '#FFF5F8', surface: '#FFFFFF', surfaceVariant: '#FCE4EC',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#1A0008', onSurface: '#880E4F',
      error: '#C62828', success: '#2E7D32', warning: '#E65100', info: '#0277BD',
      divider: '#F48FB1', shadow: 'rgba(173,20,87,0.15)',
    },
  },

  'CRM & Business': {
    name: 'Corporate Blue',
    dark: {
      primary: '#1565C0', primaryLight: '#5E92F3', primaryDark: '#003C8F',
      secondary: '#00838F', secondaryLight: '#4FB3BF', accent: '#FFC400',
      background: '#060B14', surface: '#0A1220', surfaceVariant: '#0F1B30',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#E3F2FD', onSurface: '#BBDEFB',
      error: '#EF5350', success: '#66BB6A', warning: '#FFA726', info: '#42A5F5',
      divider: '#142030', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#1565C0', primaryLight: '#1976D2', primaryDark: '#003C8F',
      secondary: '#00838F', secondaryLight: '#0097A7', accent: '#F9A825',
      background: '#F5F8FF', surface: '#FFFFFF', surfaceVariant: '#E3F2FD',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#061020', onSurface: '#0D2040',
      error: '#C62828', success: '#2E7D32', warning: '#E65100', info: '#0277BD',
      divider: '#BBDEFB', shadow: 'rgba(21,101,192,0.15)',
    },
  },

  'Chat & Communication': {
    name: 'Messenger Teal',
    dark: {
      primary: '#00BFA5', primaryLight: '#1DE9B6', primaryDark: '#00867D',
      secondary: '#6200EA', secondaryLight: '#7C4DFF', accent: '#FFD600',
      background: '#050F0E', surface: '#0A1917', surfaceVariant: '#0F2421',
      onPrimary: '#000000', onSecondary: '#FFFFFF', onBackground: '#E0F2F1', onSurface: '#B2DFDB',
      error: '#FF5252', success: '#69F0AE', warning: '#FFD740', info: '#40C4FF',
      divider: '#102A28', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#00695C', primaryLight: '#00897B', primaryDark: '#004D40',
      secondary: '#4527A0', secondaryLight: '#512DA8', accent: '#FFC400',
      background: '#F5FFFD', surface: '#FFFFFF', surfaceVariant: '#E0F2F1',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#00201E', onSurface: '#004D40',
      error: '#B71C1C', success: '#1B5E20', warning: '#E65100', info: '#006064',
      divider: '#B2DFDB', shadow: 'rgba(0,105,92,0.15)',
    },
  },

  'Travel & Tourism': {
    name: 'Sky Blue',
    dark: {
      primary: '#039BE5', primaryLight: '#4FC3F7', primaryDark: '#006DB3',
      secondary: '#FF7043', secondaryLight: '#FF8A65', accent: '#FFD54F',
      background: '#040E1A', surface: '#081828', surfaceVariant: '#0C2236',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#E1F5FE', onSurface: '#B3E5FC',
      error: '#FF5252', success: '#69F0AE', warning: '#FFD740', info: '#40C4FF',
      divider: '#102030', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#0277BD', primaryLight: '#0288D1', primaryDark: '#01579B',
      secondary: '#E64A19', secondaryLight: '#FF5722', accent: '#F9A825',
      background: '#F5FCFF', surface: '#FFFFFF', surfaceVariant: '#E1F5FE',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#01101E', onSurface: '#01579B',
      error: '#C62828', success: '#2E7D32', warning: '#E65100', info: '#0277BD',
      divider: '#B3E5FC', shadow: 'rgba(2,119,189,0.15)',
    },
  },

  'Agriculture': {
    name: 'Earth Green',
    dark: {
      primary: '#558B2F', primaryLight: '#7CB342', primaryDark: '#33691E',
      secondary: '#8D6E63', secondaryLight: '#A1887F', accent: '#FFD54F',
      background: '#060A04', surface: '#0C1208', surfaceVariant: '#121C0C',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#F1F8E9', onSurface: '#DCEDC8',
      error: '#FF5252', success: '#69F0AE', warning: '#FFD740', info: '#40C4FF',
      divider: '#182210', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#33691E', primaryLight: '#558B2F', primaryDark: '#1B5E20',
      secondary: '#6D4C41', secondaryLight: '#8D6E63', accent: '#F9A825',
      background: '#F6FAF2', surface: '#FFFFFF', surfaceVariant: '#F1F8E9',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#0A1606', onSurface: '#1B5E20',
      error: '#B71C1C', success: '#1B5E20', warning: '#E65100', info: '#0277BD',
      divider: '#DCEDC8', shadow: 'rgba(51,105,30,0.15)',
    },
  },

  'Manufacturing': {
    name: 'Industrial Steel',
    dark: {
      primary: '#546E7A', primaryLight: '#78909C', primaryDark: '#29434E',
      secondary: '#F57C00', secondaryLight: '#FFA040', accent: '#FFD600',
      background: '#060A0C', surface: '#0C1418', surfaceVariant: '#121E24',
      onPrimary: '#FFFFFF', onSecondary: '#1A0800', onBackground: '#ECEFF1', onSurface: '#CFD8DC',
      error: '#FF5252', success: '#69F0AE', warning: '#FFD740', info: '#40C4FF',
      divider: '#182028', shadow: 'rgba(0,0,0,0.6)',
    },
    light: {
      primary: '#37474F', primaryLight: '#546E7A', primaryDark: '#263238',
      secondary: '#E65100', secondaryLight: '#F57C00', accent: '#F9A825',
      background: '#F5F7F8', surface: '#FFFFFF', surfaceVariant: '#ECEFF1',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#0A1014', onSurface: '#263238',
      error: '#C62828', success: '#2E7D32', warning: '#E65100', info: '#0277BD',
      divider: '#CFD8DC', shadow: 'rgba(55,71,79,0.15)',
    },
  },

  'Custom': {
    name: 'AppForge Default',
    dark: {
      primary: '#6C63FF', primaryLight: '#9D97FF', primaryDark: '#4B44CC',
      secondary: '#FF6584', secondaryLight: '#FF92A8', accent: '#43E8D8',
      background: '#0F1117', surface: '#1A1D2E', surfaceVariant: '#252840',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#E8EAF6', onSurface: '#C5CAE9',
      error: '#FF5252', success: '#69F0AE', warning: '#FFD740', info: '#40C4FF',
      divider: '#2A2D45', shadow: 'rgba(0,0,0,0.5)',
    },
    light: {
      primary: '#5c56d4', primaryLight: '#7b76e1', primaryDark: '#3d39b3',
      secondary: '#e0365e', secondaryLight: '#e85f7f', accent: '#009688',
      background: '#f8f9ff', surface: '#ffffff', surfaceVariant: '#eef0ff',
      onPrimary: '#FFFFFF', onSecondary: '#FFFFFF', onBackground: '#0f1117', onSurface: '#1a1d2e',
      error: '#d32f2f', success: '#388e3c', warning: '#f57c00', info: '#1976d2',
      divider: '#d1d5f0', shadow: 'rgba(108,99,255,0.15)',
    },
  },
};

// ─── Generate Theme ───────────────────────────────────────────────────────────

export function generateTheme(
  industry: IndustryType,
  mode: 'light' | 'dark' = 'dark',
  overrides?: Partial<ColorPalette>
): ThemeTokens {
  const palette = INDUSTRY_PALETTES[industry] || INDUSTRY_PALETTES['Custom'];
  const colors = { ...(mode === 'dark' ? palette.dark : palette.light), ...overrides };

  return {
    mode,
    colors,
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      fontFamily: getFontForIndustry(industry),
    },
    spacing: DEFAULT_SPACING,
    borderRadius: getRadiusForIndustry(industry),
    elevation: DEFAULT_ELEVATION,
    iconSet: 'lucide',
  };
}

function getFontForIndustry(industry: IndustryType): string {
  const fonts: Partial<Record<IndustryType, string>> = {
    'Healthcare': 'Inter',
    'Education': 'Nunito',
    'E-Commerce': 'Poppins',
    'Food & Delivery': 'Nunito',
    'Transportation': 'Inter',
    'Finance & Banking': 'IBM Plex Sans',
    'Real Estate': 'Playfair Display',
    'Social Media': 'Inter',
    'Fitness & Health': 'Oswald',
    'Entertainment': 'Montserrat',
    'CRM & Business': 'IBM Plex Sans',
    'Chat & Communication': 'Inter',
    'Travel & Tourism': 'Poppins',
    'Agriculture': 'Nunito',
    'Manufacturing': 'Roboto',
    'Custom': 'Inter',
  };
  return fonts[industry] || 'Inter';
}

function getRadiusForIndustry(industry: IndustryType) {
  // Healthcare and Finance use smaller radius (more formal)
  // Social and Entertainment use larger radius (more playful)
  const formal: IndustryType[] = ['Healthcare', 'Finance & Banking', 'CRM & Business', 'Manufacturing'];
  const playful: IndustryType[] = ['Social Media', 'Entertainment', 'Fitness & Health', 'Food & Delivery'];

  if (formal.includes(industry)) {
    return { none: 0, xs: 2, sm: 4, md: 6, lg: 10, xl: 14, xxl: 18, full: 9999 };
  }
  if (playful.includes(industry)) {
    return { none: 0, xs: 4, sm: 8, md: 14, lg: 20, xl: 28, xxl: 36, full: 9999 };
  }
  return DEFAULT_RADIUS;
}

// ─── Get Palette Info ─────────────────────────────────────────────────────────

export function getPaletteInfo(industry: IndustryType): { name: string; primary: string; secondary: string } {
  const palette = INDUSTRY_PALETTES[industry] || INDUSTRY_PALETTES['Custom'];
  return {
    name: palette.name,
    primary: palette.dark.primary,
    secondary: palette.dark.secondary,
  };
}

export function getAllPalettes() {
  return Object.entries(INDUSTRY_PALETTES).map(([industry, palette]) => ({
    industry: industry as IndustryType,
    name: palette.name,
    primary: palette.dark.primary,
    secondary: palette.dark.secondary,
    accent: palette.dark.accent,
  }));
}
