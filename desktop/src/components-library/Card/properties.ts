export interface CardProperties {
  elevation: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  padding: number;
}

export const CARD_PROPERTIES_METADATA = {
  elevation: {
    type: 'select',
    label: 'Shadow Elevation',
    options: ['none', 'sm', 'md', 'lg', 'xl'],
    default: 'md',
  },
  padding: {
    type: 'number',
    label: 'Internal Padding (px)',
    default: 14,
  },
};
