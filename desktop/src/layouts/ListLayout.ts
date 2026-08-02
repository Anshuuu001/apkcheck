import type { LayoutTemplate } from './types';

export const ListLayout: LayoutTemplate = {
  id: 'layout-list',
  name: 'List',
  description: 'Search bar, filterable scrollable list, and FAB',
  category: 'data',
  slots: [
    { id: 'header', name: 'Header Bar', position: 'top', flex: 0, acceptsComponents: ['TopBar'], defaultComponent: 'TopBar' },
    { id: 'search', name: 'Search & Filter', position: 'top', flex: 0, acceptsComponents: ['SearchBar', 'FilterChips'], defaultComponent: 'SearchBar' },
    { id: 'list', name: 'List Content', position: 'center', flex: 5, acceptsComponents: ['ListItem', 'Card', 'Table'], defaultComponent: 'ListItem' },
    { id: 'fab', name: 'Floating Action', position: 'bottom', flex: 0, acceptsComponents: ['FAB', 'Button'], defaultComponent: 'FAB' },
  ],
  defaultComponents: ['TopBar', 'SearchBar', 'ListItem', 'FAB'],
};
