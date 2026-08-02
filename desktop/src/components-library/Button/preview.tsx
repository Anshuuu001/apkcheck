import React from 'react';
import type { ThemeTokens } from '../../blueprint/schema';
import type { ButtonProperties } from './properties';

interface ButtonPreviewProps {
  props: Partial<ButtonProperties>;
  theme: ThemeTokens;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const ButtonPreview: React.FC<ButtonPreviewProps> = ({
  props,
  theme,
  onClick,
  style,
}) => {
  const label = props.label || 'Button';
  const variant = props.variant || 'primary';
  const fullWidth = props.fullWidth || false;

  const baseStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: theme.borderRadius.lg,
    fontFamily: theme.typography.fontFamily,
    fontSize: 13,
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'opacity 0.15s',
    width: fullWidth ? '100%' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...style,
  };

  const variantStyle =
    variant === 'primary'
      ? { background: theme.colors.primary, color: theme.colors.onPrimary }
      : variant === 'outlined'
      ? { background: 'transparent', color: theme.colors.primary, border: `1.5px solid ${theme.colors.primary}` }
      : variant === 'ghost'
      ? { background: 'transparent', color: theme.colors.onSurface }
      : variant === 'danger'
      ? { background: theme.colors.error, color: '#fff' }
      : { background: theme.colors.surface, color: theme.colors.onSurface };

  return (
    <button onClick={onClick} style={{ ...baseStyle, ...variantStyle }}>
      {label}
    </button>
  );
};
