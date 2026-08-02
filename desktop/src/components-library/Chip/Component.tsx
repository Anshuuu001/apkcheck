import React from 'react';
import { chipStyles } from './styles';

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export const ChipComponent: React.FC<ChipProps> = ({ label, selected = false, onClick }) => {
  return (
    <div style={chipStyles.chip(selected)} onClick={onClick}>
      {label}
    </div>
  );
};
