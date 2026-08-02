import type { LayoutTemplate } from './types';

export const HospitalLayout: LayoutTemplate = {
  id: 'layout-hospital',
  name: 'Hospital',
  description: 'Patient info header, vitals cards, action buttons',
  category: 'healthcare',
  slots: [
    { id: 'header', name: 'Patient Header', position: 'top', flex: 0, acceptsComponents: ['TopBar', 'PatientInfoBar'], defaultComponent: 'TopBar' },
    { id: 'vitals', name: 'Vitals Cards', position: 'top', flex: 1, acceptsComponents: ['StatCard', 'VitalCard'], defaultComponent: 'StatCard' },
    { id: 'content', name: 'Main Content', position: 'center', flex: 3, acceptsComponents: ['Card', 'Table', 'Timeline', 'Calendar'], defaultComponent: 'Card' },
    { id: 'actions', name: 'Quick Actions', position: 'bottom', flex: 0, acceptsComponents: ['Button', 'ActionGrid'], defaultComponent: 'Button' },
  ],
  defaultComponents: ['TopBar', 'StatCard', 'Card', 'Button'],
};
