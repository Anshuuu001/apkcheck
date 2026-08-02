import type { LayoutTemplate } from './types';

export const ProfileLayout: LayoutTemplate = {
  id: 'layout-profile',
  name: 'Profile',
  description: 'Avatar, info section, settings list',
  category: 'user',
  slots: [
    { id: 'header', name: 'Profile Header', position: 'top', flex: 0, acceptsComponents: ['TopBar'], defaultComponent: 'TopBar' },
    { id: 'avatar', name: 'Avatar Section', position: 'top', flex: 1, acceptsComponents: ['Avatar', 'Heading', 'Badge'], defaultComponent: 'Avatar' },
    { id: 'info', name: 'Info Section', position: 'center', flex: 1, acceptsComponents: ['StatCard', 'Row'], defaultComponent: 'StatCard' },
    { id: 'settings', name: 'Settings List', position: 'center', flex: 3, acceptsComponents: ['ListTile', 'ListItem', 'Toggle'], defaultComponent: 'ListTile' },
    { id: 'actions', name: 'Actions', position: 'bottom', flex: 0, acceptsComponents: ['Button'], defaultComponent: 'Button' },
  ],
  defaultComponents: ['TopBar', 'Avatar', 'StatCard', 'ListTile', 'Button'],
};
