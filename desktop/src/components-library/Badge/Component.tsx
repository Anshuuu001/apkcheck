import React from 'react';
import { badgeStyles } from './styles';

interface BadgeProps {
  count: number;
  maxCount?: number;
  variant?: 'primary' | 'success' | 'error' | 'warning';
}

export const BadgeComponent: React.FC<BadgeProps> = ({ count, maxCount = 99, variant = 'primary' }) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  return (
    <div style={badgeStyles.container}>
      <span style={badgeStyles.badge(variant)}>{displayCount}</span>
    </div>
  );
};
