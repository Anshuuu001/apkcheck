import type { AppBlueprint } from '../blueprint/schema';
import { generateTheme } from '../ai/planner/ThemePlanner';
import { generateBlueprintId, generateId } from '../blueprint/parser';

const theme = generateTheme('Finance & Banking', 'dark');
const now = new Date().toISOString();

export const BANKING_TEMPLATE: AppBlueprint = {
  id: generateBlueprintId(),
  version: '1.0.0',
  schemaVersion: '1',
  createdAt: now,
  updatedAt: now,
  name: 'Mobile Banking App',
  packageName: 'com.appforge.banking',
  description: 'Secure checking accounts tracker with fast transfers and bill payment widgets',
  industry: 'Finance & Banking',
  appType: 'Mobile Banking',
  users: ['Customer', 'Admin'],
  authRequired: true,
  theme,
  screens: [
    {
      id: generateId('screen'),
      name: 'DashboardScreen',
      route: 'Dashboard',
      type: 'dashboard',
      title: 'Accounts Overview',
      description: 'View accounts summary and balances',
      userRoles: ['Customer', 'Admin'],
      components: [
        { id: generateId('comp'), type: 'TopBar', props: { title: 'First Bank' } },
        { id: generateId('comp'), type: 'StatCard', props: { title: 'Available Balance', value: '$12,450.80' } },
        { id: generateId('comp'), type: 'Button', props: { label: 'Transfer Money', variant: 'primary' } },
        { id: generateId('comp'), type: 'BottomNav', props: {} }
      ],
      apiCalls: ['getAccountSummary']
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
          { name: 'Dashboard', screenId: 'DashboardScreen', label: 'Accounts', icon: 'credit-card' }
        ]
      }
    ]
  },
  database: {
    dbType: 'sqlite',
    tables: [
      {
        id: generateId('table'),
        name: 'accounts',
        comment: 'Customer accounts balances',
        fields: [
          { name: 'id', type: 'BIGINT', primaryKey: true, nullable: false, autoIncrement: true },
          { name: 'account_number', type: 'VARCHAR', length: 50, nullable: false },
          { name: 'balance', type: 'DECIMAL', nullable: false }
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
      { id: 'getAccountSummary', path: '/accounts/summary', method: 'GET', tag: 'Accounts', summary: 'Get details', auth: 'user', responseCode: 200 }
    ]
  },
  businessLogic: [],
  permissions: [
    { name: 'biometric', platform: 'both', reason: 'Required for secure fingerprint login authentication', required: true }
  ]
};
