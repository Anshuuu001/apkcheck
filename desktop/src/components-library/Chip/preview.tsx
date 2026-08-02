import React, { useState } from 'react';
import { ChipComponent } from './Component';

export const ChipPreview: React.FC = () => {
  const [selected, setSelected] = useState(false);
  return (
    <ChipComponent
      label="Option Chip"
      selected={selected}
      onClick={() => setSelected(!selected)}
    />
  );
};
