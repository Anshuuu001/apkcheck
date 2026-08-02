import type { AppBlueprint } from '../blueprint/schema';
import { generateTheme } from '../ai/planner/ThemePlanner';
import { generateBlueprintId, generateId } from '../blueprint/parser';

const theme = generateTheme('E-Commerce', 'dark');
const now = new Date().toISOString();

export const ECOMMERCE_TEMPLATE: AppBlueprint = {
  id: generateBlueprintId(),
  version: '1.0.0',
  schemaVersion: '1',
  createdAt: now,
  updatedAt: now,
  name: 'E-Commerce Store',
  packageName: 'com.appforge.ecommerce',
  description: 'Full-featured online store with products list, shopping cart, and order checkout',
  industry: 'E-Commerce',
  appType: 'Mobile Shop',
  users: ['Customer', 'Seller', 'Admin'],
  authRequired: true,
  theme,
  screens: [
    {
      id: generateId('screen'),
      name: 'ShopScreen',
      route: 'Shop',
      type: 'home',
      title: 'Storefront',
      description: 'List products to browse',
      userRoles: ['Customer', 'Admin'],
      components: [
        { id: generateId('comp'), type: 'TopBar', props: { title: 'Quick Shop' } },
        { id: generateId('comp'), type: 'SearchBar', props: { placeholder: 'Search products...' } },
        { id: generateId('comp'), type: 'ProductCard', props: { name: 'Running Shoes', price: 89.99 } },
        { id: generateId('comp'), type: 'ProductCard', props: { name: 'Sports Watch', price: 149.99 } },
        { id: generateId('comp'), type: 'BottomNav', props: {} }
      ],
      apiCalls: ['getProducts']
    },
    {
      id: generateId('screen'),
      name: 'CartScreen',
      route: 'Cart',
      type: 'form',
      title: 'Your Cart',
      description: 'Manage cart and checkout',
      userRoles: ['Customer', 'Admin'],
      components: [
        { id: generateId('comp'), type: 'TopBar', props: { title: 'Shopping Cart' } },
        { id: generateId('comp'), type: 'CartItem', props: { name: 'Running Shoes', qty: 1 } },
        { id: generateId('comp'), type: 'Button', props: { label: 'Proceed to Checkout', variant: 'primary' } }
      ],
      apiCalls: ['getCart', 'checkoutCart']
    }
  ],
  navigation: {
    type: 'bottom-tabs',
    groups: [
      {
        id: 'main-group',
        type: 'tab',
        userRoles: ['Customer', 'Admin'],
        routes: [
          { name: 'Shop', screenId: 'ShopScreen', label: 'Shop', icon: 'shopping-bag' },
          { name: 'Cart', screenId: 'CartScreen', label: 'Cart', icon: 'shopping-cart' }
        ]
      }
    ]
  },
  database: {
    dbType: 'sqlite',
    tables: [
      {
        id: generateId('table'),
        name: 'products',
        comment: 'Store catalog details',
        fields: [
          { name: 'id', type: 'BIGINT', primaryKey: true, nullable: false, autoIncrement: true },
          { name: 'name', type: 'VARCHAR', length: 255, nullable: false },
          { name: 'price', type: 'DECIMAL', nullable: false }
        ]
      }
    ],
    relationships: []
  },
  api: {
    baseUrl: 'http://localhost:8080/api',
    version: 'v1',
    authScheme: 'jwt',
    endpoints: [
      { id: 'getProducts', path: '/products', method: 'GET', tag: 'Catalog', summary: 'Get products list', auth: 'public', responseCode: 200 }
    ]
  },
  businessLogic: [],
  permissions: []
};
