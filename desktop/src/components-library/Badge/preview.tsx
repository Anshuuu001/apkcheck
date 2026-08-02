import React from 'react';
import { BadgeComponent } from './Component';

export const BadgePreview: React.FC = () => {
  return (
    <BadgeComponent
      count={5}
      variant="error"
    />
  );
};
