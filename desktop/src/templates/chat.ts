import type { AppBlueprint } from '../blueprint/schema';
import { generateTheme } from '../ai/planner/ThemePlanner';
import { generateBlueprintId, generateId } from '../blueprint/parser';

const theme = generateTheme('Chat & Communication', 'dark');
const now = new Date().toISOString();

export const CHAT_TEMPLATE: AppBlueprint = {
  id: generateBlueprintId(),
  version: '1.0.0',
  schemaVersion: '1',
  createdAt: now,
  updatedAt: now,
  name: 'Instant Messenger',
  packageName: 'com.appforge.chat',
  description: 'Real-time text chat conversations list and messaging viewports',
  industry: 'Chat & Communication',
  appType: 'Instant Messenger',
  users: ['User', 'Admin'],
  authRequired: true,
  theme,
  screens: [
    {
      id: generateId('screen'),
      name: 'InboxScreen',
      route: 'Inbox',
      type: 'list',
      title: 'Conversations',
      description: 'View active chat conversations',
      userRoles: ['User', 'Admin'],
      components: [
        { id: generateId('comp'), type: 'TopBar', props: { title: 'Chats' } },
        { id: generateId('comp'), type: 'ListItem', props: { title: 'Alex Johnson', desc: 'Hey, are we still on for today?' } },
        { id: generateId('comp'), type: 'BottomNav', props: {} }
      ],
      apiCalls: ['getInbox']
    }
  ],
  navigation: {
    type: 'bottom-tabs',
    groups: [
      {
        id: 'main-group',
        type: 'tab',
        userRoles: ['User', 'Admin'],
        routes: [
          { name: 'Inbox', screenId: 'InboxScreen', label: 'Inbox', icon: 'message-circle' }
        ]
      }
    ]
  },
  database: {
    dbType: 'sqlite',
    tables: [
      {
        id: generateId('table'),
        name: 'messages',
        comment: 'User text logs',
        fields: [
          { name: 'id', type: 'BIGINT', primaryKey: true, nullable: false, autoIncrement: true },
          { name: 'sender_id', type: 'BIGINT', nullable: false },
          { name: 'body', type: 'TEXT', nullable: false }
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
      { id: 'getInbox', path: '/chats/inbox', method: 'GET', tag: 'Inbox', summary: 'Conversations index', auth: 'user', responseCode: 200 }
    ]
  },
  businessLogic: [],
  permissions: [
    { name: 'POST_NOTIFICATIONS', platform: 'both', reason: 'Required to notify updates', required: true }
  ]
};
