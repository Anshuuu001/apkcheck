import type { LayoutTemplate } from './types';

export const DashboardLayout: LayoutTemplate = {
  id: 'layout-dashboard',
  name: 'Dashboard',
  description: 'Stats cards, quick actions, and summary charts',
  category: 'admin',
  slots: [
    { id: 'header', name: 'Header Bar', position: 'top', flex: 0, acceptsComponents: ['TopBar', 'SearchBar'], defaultComponent: 'TopBar' },
    { id: 'stats', name: 'Stats Row', position: 'top', flex: 1, acceptsComponents: ['StatCard', 'KPICard'], defaultComponent: 'StatCard' },
    { id: 'quickActions', name: 'Quick Actions', position: 'center', flex: 1, acceptsComponents: ['ActionGrid', 'Row', 'Button'], defaultComponent: 'ActionGrid' },
    { id: 'content', name: 'Main Content', position: 'center', flex: 3, acceptsComponents: ['Chart', 'Table', 'Card', 'List'], defaultComponent: 'Card' },
    { id: 'bottomNav', name: 'Bottom Navigation', position: 'bottom', flex: 0, acceptsComponents: ['BottomNavigation'], defaultComponent: 'BottomNavigation' },
  ],
  defaultComponents: ['TopBar', 'StatCard', 'ActionGrid', 'Card', 'BottomNavigation'],
};
