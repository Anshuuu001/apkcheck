import React from 'react';

interface SelectionOutlineProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  onDelete?: () => void;
}

export const SelectionOutline: React.FC<SelectionOutlineProps> = ({ x, y, w, h, label, onDelete }) => {
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y,
      width: w,
      height: h,
      border: '2px solid #2196F3',
      boxShadow: '0 0 8px rgba(33, 150, 243, 0.4)',
      pointerEvents: 'none',
      zIndex: 100,
      transition: 'all 0.1s ease',
    }}>
      {label && (
        <div style={{
          position: 'absolute',
          top: -20,
          left: -2,
          background: '#2196F3',
          color: '#fff',
          fontSize: 10,
          padding: '2px 6px',
          borderRadius: '2px 2px 0 0',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          pointerEvents: 'auto',
        }}>
          {label}
          {onDelete && (
            <span 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ marginLeft: 6, cursor: 'pointer', color: '#ffcdd2' }}
            >
              ×
            </span>
          )}
        </div>
      )}
    </div>
  );
};
