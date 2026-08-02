import type { AppBlueprint } from '../blueprint/schema';
import { generateTheme } from '../ai/planner/ThemePlanner';
import { generateBlueprintId, generateId } from '../blueprint/parser';

const theme = generateTheme('Healthcare', 'dark');

export const BOOKING_TEMPLATE: AppBlueprint = {
  id: generateBlueprintId(),
  projectId: 0,
  name: 'Calendar & Bookings',
  description: 'Online scheduler and slot booking appointments calendar system',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  theme,
  screens: [
    {
      id: generateId('screen'),
      name: 'CalendarScreen',
      route: 'Calendar',
      type: 'dashboard',
      title: 'Appointments Calendar',
      description: 'View and book available slots',
      userRoles: ['User'],
      components: [
        { id: generateId('comp'), type: 'TopBar', props: { title: 'Appts Scheduler' } },
        { id: generateId('comp'), type: 'Calendar', props: { initialMode: 'month' } },
        { id: generateId('comp'), type: 'Button', props: { label: 'Book Slot', variant: 'primary' } }
      ],
      apiCalls: ['getSlots', 'createBooking']
    }
  ],
  navigation: {
    type: 'stack-only',
    groups: [
      {
        id: 'main-group',
        type: 'stack',
        userRoles: ['User'],
        routes: [
          { name: 'Calendar', screenId: 'CalendarScreen', label: 'Calendar', icon: 'calendar' }
        ]
      }
    ]
  },
  database: {
    dbType: 'sqlite',
    tables: [
      {
        id: generateId('table'),
        name: 'bookings',
        comment: 'Customer schedule slots',
        fields: [
          { name: 'id', type: 'BIGINT', primaryKey: true, nullable: false, autoIncrement: true },
          { name: 'booking_date', type: 'VARCHAR', length: 50, nullable: false },
          { name: 'slot_time', type: 'VARCHAR', length: 50, nullable: false }
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
      { id: 'getSlots', path: '/slots/available', method: 'GET', tag: 'Slots', summary: 'Get open slots', auth: 'public', responseCode: 200 }
    ]
  },
  businessLogic: [],
  permissions: [
    { name: 'calendar', platform: 'both', reason: 'Required to schedule slots on device calendar', required: true }
  ]
};
