import React from 'react';
import type { ScreenBlueprint, ThemeTokens } from '../blueprint/schema';
import { ComponentRenderer } from './PreviewComponents';

interface CanvasProps {
  screen: ScreenBlueprint;
  theme: ThemeTokens;
  scale: number;
  selectedComponentId?: string | null;
  onSelectComponent?: (id: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ screen, theme, scale, selectedComponentId, onSelectComponent }) => {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      overflow: 'hidden',
    }}>
      {screen.components.map(comp => (
        <div 
          key={comp.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelectComponent?.(comp.id);
          }}
          style={{
            border: selectedComponentId === comp.id ? '2px dashed #2196F3' : 'none',
            cursor: 'pointer',
          }}
        >
          <ComponentRenderer component={comp} theme={theme} />
        </div>
      ))}
    </div>
  );
};
