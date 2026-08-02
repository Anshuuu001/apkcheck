import type { LayoutTemplate } from './types';

export const AuthLayout: LayoutTemplate = {
  id: 'layout-auth',
  name: 'Auth',
  description: 'Centered card with branding, form fields, social auth',
  category: 'auth',
  slots: [
    { id: 'branding', name: 'Branding', position: 'top', flex: 2, acceptsComponents: ['Image', 'Heading'], defaultComponent: 'Image' },
    { id: 'form', name: 'Auth Form', position: 'center', flex: 3, acceptsComponents: ['TextField', 'PasswordField', 'Button'], defaultComponent: 'TextField' },
    { id: 'social', name: 'Social Auth', position: 'bottom', flex: 1, acceptsComponents: ['SocialAuthButton', 'Divider'], defaultComponent: 'SocialAuthButton' },
  ],
  defaultComponents: ['Image', 'TextField', 'Button', 'SocialAuthButton'],
};
