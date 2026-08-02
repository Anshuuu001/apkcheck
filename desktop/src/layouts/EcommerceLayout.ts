import type { LayoutTemplate } from './types';

export const EcommerceLayout: LayoutTemplate = {
  id: 'layout-ecommerce',
  name: 'E-Commerce',
  description: 'Category tabs, product grid, cart badge',
  category: 'shopping',
  slots: [
    { id: 'header', name: 'Shop Header', position: 'top', flex: 0, acceptsComponents: ['TopBar', 'SearchBar'], defaultComponent: 'TopBar' },
    { id: 'categories', name: 'Category Tabs', position: 'top', flex: 0, acceptsComponents: ['TabBar', 'FilterChips'], defaultComponent: 'TabBar' },
    { id: 'products', name: 'Product Grid', position: 'center', flex: 5, acceptsComponents: ['ProductCard', 'Grid', 'Card'], defaultComponent: 'ProductCard' },
    { id: 'bottomNav', name: 'Bottom Navigation', position: 'bottom', flex: 0, acceptsComponents: ['BottomNavigation'], defaultComponent: 'BottomNavigation' },
  ],
  defaultComponents: ['TopBar', 'TabBar', 'ProductCard', 'BottomNavigation'],
};
