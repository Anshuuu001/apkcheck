import { colors } from './colors';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadow } from './shadow';
import { elevation } from './elevation';
import { motion } from './motion';
import { icons } from './icons';
import { breakpoints } from './breakpoints';

export const theme = {
  colors,
  spacing,
  radius,
  shadow,
  elevation,
  motion,
  icons,
  breakpoints,
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      bold: '700',
    }
  }
};

export type AppTheme = typeof theme;
export default theme;
