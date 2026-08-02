import type { AppBlueprint } from '../blueprint/schema';
import { generateTheme } from '../ai/planner/ThemePlanner';
import { generateBlueprintId, generateId } from '../blueprint/parser';

const theme = generateTheme('CRM & Business', 'dark');
const now = new Date().toISOString();

export const CRM_TEMPLATE: AppBlueprint = {
  id: generateBlueprintId(),
  version: '1.0.0',
  schemaVersion: '1',
  createdAt: now,
  updatedAt: now,
  name: 'Sales CRM Assistant',
  packageName: 'com.appforge.crm',
  description: 'Enterprise pipeline deal dashboard tracking lead lists and sales tasks',
  industry: 'CRM & Business',
  appType: 'Sales CRM',
  users: ['Sales Rep', 'Manager', 'Admin'],
  authRequired: true,
  theme,
  screens: [
    {
      id: generateId('screen'),
      name: 'LeadsScreen',
      route: 'Leads',
      type: 'list',
      title: 'Sales Opportunities',
      description: 'Manage sales deals pipeline',
      userRoles: ['Sales Rep', 'Admin'],
      components: [
        { id: generateId('comp'), type: 'TopBar', props: { title: 'Sales Pipeline' } },
        { id: generateId('comp'), type: 'ListItem', props: { title: 'Acme Corp Deal', desc: 'Negotiation phase - $50,000' } },
        { id: generateId('comp'), type: 'FAB', props: { icon: 'plus' } }
      ],
      apiCalls: ['getLeads']
    }
  ],
  navigation: {
    type: 'drawer',
    groups: [
      {
        id: 'main-group',
        type: 'drawer',
        userRoles: ['Sales Rep', 'Admin'],
        routes: [
          { name: 'Leads', screenId: 'LeadsScreen', label: 'My Deals', icon: 'trending-up' }
        ]
      }
    ]
  },
  database: {
    dbType: 'sqlite',
    tables: [
      {
        id: generateId('table'),
        name: 'leads',
        comment: 'Sales opportunities trackers',
        fields: [
          { name: 'id', type: 'BIGINT', primaryKey: true, nullable: false, autoIncrement: true },
          { name: 'company_name', type: 'VARCHAR', length: 150, nullable: false },
          { name: 'deal_value', type: 'DECIMAL', nullable: true }
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
      { id: 'getLeads', path: '/leads', method: 'GET', tag: 'Deals', summary: 'Get sales leads', auth: 'user', responseCode: 200 }
    ]
  },
  businessLogic: [],
  permissions: []
};
