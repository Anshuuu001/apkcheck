import React from 'react';
import type { ThemeTokens } from '../../blueprint/schema';
import type { CardProperties } from './properties';

interface CardPreviewProps {
  props: Partial<CardProperties>;
  theme: ThemeTokens;
  children?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const CardPreview: React.FC<CardPreviewProps> = ({
  props,
  theme,
  children,
  onClick,
  style,
}) => {
  const elevation = props.elevation || 'md';
  const padding = props.padding ?? 14;

  const cardStyle: React.CSSProperties = {
    background: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding,
    boxShadow: theme.elevation[elevation],
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    ...style,
  };

  return (
    <div onClick={onClick} style={cardStyle}>
      {children || (
        <>
          <div style={{ height: 12, borderRadius: 6, background: theme.colors.surfaceVariant, width: '70%' }} />
          <div style={{ height: 8, borderRadius: 4, background: theme.colors.divider, width: '50%' }} />
        </>
      )}
    </div>
  );
};
