import type { LayoutTemplate } from './types';

export const FormLayout: LayoutTemplate = {
  id: 'layout-form',
  name: 'Form',
  description: 'Labeled input fields with validation and submit CTA',
  category: 'input',
  slots: [
    { id: 'header', name: 'Header Bar', position: 'top', flex: 0, acceptsComponents: ['TopBar'], defaultComponent: 'TopBar' },
    { id: 'fields', name: 'Form Fields', position: 'center', flex: 4, acceptsComponents: ['TextField', 'PasswordField', 'Dropdown', 'DatePicker', 'Toggle', 'TextArea', 'FileUpload'], defaultComponent: 'TextField' },
    { id: 'actions', name: 'Action Buttons', position: 'bottom', flex: 0, acceptsComponents: ['Button'], defaultComponent: 'Button' },
  ],
  defaultComponents: ['TopBar', 'TextField', 'Button'],
};
