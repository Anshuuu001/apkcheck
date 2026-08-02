export interface ButtonProperties {
  label: string;
  variant: 'primary' | 'outlined' | 'ghost' | 'danger';
  fullWidth: boolean;
}

export const BUTTON_PROPERTIES_METADATA = {
  label: {
    type: 'string',
    label: 'Button Label',
    default: 'Button',
  },
  variant: {
    type: 'select',
    label: 'Button Variant',
    options: ['primary', 'outlined', 'ghost', 'danger'],
    default: 'primary',
  },
  fullWidth: {
    type: 'boolean',
    label: 'Stretch Full Width',
    default: false,
  },
};
