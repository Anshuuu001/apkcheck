import React from 'react';

export const CanvasGrid: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'rgba(255,255,255,0.03)' }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
      backgroundSize: `${size}px ${size}px`,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  );
};
