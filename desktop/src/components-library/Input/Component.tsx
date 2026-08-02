import React from 'react';
import { inputStyles } from './styles';

interface InputProps {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
}

export const InputComponent: React.FC<InputProps> = ({ label, placeholder, value, onChange }) => {
  return (
    <div style={inputStyles.container}>
      <label style={inputStyles.label}>{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        style={inputStyles.field}
      />
    </div>
  );
};
