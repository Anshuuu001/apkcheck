/**
 * AppForge-AI — Template Registry
 * Exports all industry template packages with metadata.
 */

import type { TemplatePackage } from '../blueprint/schema';
import { HOSPITAL_TEMPLATE } from './hospital';
import { ECOMMERCE_TEMPLATE } from './ecommerce';
import { BANKING_TEMPLATE } from './banking';
import { CRM_TEMPLATE } from './crm';
import { CHAT_TEMPLATE } from './chat';
import { generateTheme } from '../ai/planner/ThemePlanner';
import { generateBlueprintId, generateId } from '../blueprint/parser';

// ─── Helper: Quick blueprint stubs for remaining templates ────────────────────
// These are lightweight stubs that get replaced when a user opens the template.
// The hospital template above shows the full pattern.

const makeStub = (
  name: string,
  industry: TemplatePackage['blueprint']['industry'],
  appType: string,
  users: string[],
  screenCount: number,
  _tableCount: number,
  _endpointCount: number,
) => {
  const theme = generateTheme(industry, 'dark');
  const now = new Date().toISOString();
  return {
    id: generateBlueprintId(), version: '1.0.0', schemaVersion: '1',
    createdAt: now, updatedAt: now,
    name, packageName: `com.appforge.${name.toLowerCase().replace(/\s/g, '')}`,
    description: `${appType} built with AppForge-AI`,
    industry, appType, users, authRequired: true, theme,
    screens: Array.from({ length: screenCount }, (_, i) => ({
      id: generateId('s'), name: `Screen${i + 1}`, type: 'custom' as const,
      title: `Screen ${i + 1}`, route: `/screen${i + 1}`, description: '',
      userRoles: users, guards: [], components: [],
    })),
    navigation: { type: 'bottom-tabs' as const, groups: [] },
    database: { dbType: 'mysql' as const, tables: [], relationships: [] },
    api: { baseUrl: '/api/v1', version: 'v1', authScheme: 'jwt' as const, endpoints: [] },
    businessLogic: [],
    permissions: [{ name: 'INTERNET', platform: 'android' as const, reason: 'API calls', required: true }],
    buildPipeline: {
      outputDir: 'output/app',
      stages: [],
      gradleConfig: {
        minSdkVersion: 24,
        targetSdkVersion: 34,
        compileSdkVersion: 34,
        versionCode: 1,
        versionName: '1.0.0',
      }
    },
  };
};

// ─── Template Registry ────────────────────────────────────────────────────────

export const TEMPLATE_REGISTRY: TemplatePackage[] = [
  {
    id: 'hospital',
    name: 'Hospital Management',
    industry: 'Healthcare',
    description: 'Complete hospital management with appointments, prescriptions, billing and analytics for doctors, patients, and admin.',
    tags: ['Healthcare', 'Appointments', 'EHR', 'Billing', 'Telemedicine'],
    icon: '🏥',
    screenCount: 9,
    tableCount: 6,
    endpointCount: 14,
    popularity: 'featured',
    blueprint: HOSPITAL_TEMPLATE,
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    industry: 'E-Commerce',
    description: 'Full-featured online store with product catalog, cart, checkout, order tracking, and seller dashboard.',
    tags: ['Shopping', 'Cart', 'Payments', 'Orders', 'Marketplace'],
    icon: '🛍️',
    screenCount: 10,
    tableCount: 7,
    endpointCount: 18,
    popularity: 'trending',
    blueprint: ECOMMERCE_TEMPLATE,
  },
  {
    id: 'food-delivery',
    name: 'Food Delivery App',
    industry: 'Food & Delivery',
    description: 'Restaurant ordering and delivery platform with real-time GPS tracking, ratings, and driver app.',
    tags: ['Food', 'Delivery', 'GPS', 'Restaurant', 'Real-time'],
    icon: '🍔',
    screenCount: 11,
    tableCount: 8,
    endpointCount: 20,
    popularity: 'trending',
    blueprint: makeStub('Food Delivery', 'Food & Delivery', 'Food Delivery App', ['Customer', 'Restaurant Owner', 'Delivery Driver', 'Admin'], 11, 8, 20),
  },
  {
    id: 'school',
    name: 'School Management',
    industry: 'Education',
    description: 'School management with live classes, attendance, assignments, grades, fee collection and parent portal.',
    tags: ['Education', 'Classes', 'Attendance', 'Grades', 'Fees'],
    icon: '🏫',
    screenCount: 9,
    tableCount: 8,
    endpointCount: 16,
    popularity: 'popular',
    blueprint: makeStub('School Management', 'Education', 'School Management System', ['Student', 'Teacher', 'Admin', 'Parent'], 9, 8, 16),
  },
  {
    id: 'crm',
    name: 'CRM & Sales',
    industry: 'CRM & Business',
    description: 'Customer relationship management with leads, pipeline, contacts, invoicing, and analytics dashboard.',
    tags: ['CRM', 'Sales', 'Leads', 'Pipeline', 'Analytics'],
    icon: '📊',
    screenCount: 8,
    tableCount: 6,
    endpointCount: 14,
    popularity: 'popular',
    blueprint: CRM_TEMPLATE,
  },
  {
    id: 'chat',
    name: 'Chat & Messaging',
    industry: 'Chat & Communication',
    description: 'Real-time messaging with group chats, file sharing, voice/video calls, and end-to-end encryption.',
    tags: ['Chat', 'Messaging', 'Voice', 'Video', 'Groups'],
    icon: '💬',
    screenCount: 7,
    tableCount: 5,
    endpointCount: 12,
    popularity: 'new',
    blueprint: CHAT_TEMPLATE,
  },
  {
    id: 'fitness',
    name: 'Fitness & Health',
    industry: 'Fitness & Health',
    description: 'Fitness app with workout plans, progress tracking, nutrition, step counter, and personal trainer chat.',
    tags: ['Fitness', 'Workout', 'Nutrition', 'Health', 'Tracking'],
    icon: '💪',
    screenCount: 8,
    tableCount: 5,
    endpointCount: 12,
    popularity: 'new',
    blueprint: makeStub('FitPro', 'Fitness & Health', 'Fitness App', ['Member', 'Trainer', 'Admin'], 8, 5, 12),
  },
  {
    id: 'social',
    name: 'Social Network',
    industry: 'Social Media',
    description: 'Social media platform with feed, stories, direct messages, groups, and content monetization.',
    tags: ['Social', 'Feed', 'Stories', 'DM', 'Community'],
    icon: '📱',
    screenCount: 9,
    tableCount: 7,
    endpointCount: 16,
    popularity: 'popular',
    blueprint: makeStub('SocialApp', 'Social Media', 'Social Network App', ['User', 'Creator', 'Moderator', 'Admin'], 9, 7, 16),
  },
  {
    id: 'taxi',
    name: 'Taxi & Ride Hailing',
    industry: 'Transportation',
    description: 'Uber-like ride booking platform with real-time GPS tracking, driver matching, and payment processing.',
    tags: ['Taxi', 'Ride', 'GPS', 'Driver', 'Payments'],
    icon: '🚕',
    screenCount: 10,
    tableCount: 6,
    endpointCount: 18,
    popularity: 'trending',
    blueprint: makeStub('RideApp', 'Transportation', 'Taxi & Ride Hailing', ['Passenger', 'Driver', 'Admin'], 10, 6, 18),
  },
  {
    id: 'real-estate',
    name: 'Real Estate',
    industry: 'Real Estate',
    description: 'Property listing platform with map view, virtual tours, agent profiles, and EMI calculator.',
    tags: ['Property', 'Real Estate', 'Map', 'Agent', 'Listings'],
    icon: '🏠',
    screenCount: 8,
    tableCount: 5,
    endpointCount: 12,
    popularity: 'new',
    blueprint: makeStub('PropFind', 'Real Estate', 'Real Estate App', ['Buyer', 'Agent', 'Admin'], 8, 5, 12),
  },
  {
    id: 'finance',
    name: 'Digital Banking',
    industry: 'Finance & Banking',
    description: 'Fintech banking app with account dashboard, fund transfer, bill payment, and investment portfolio.',
    tags: ['Banking', 'Finance', 'Transfer', 'Investment', 'Wallet'],
    icon: '🏦',
    screenCount: 9,
    tableCount: 7,
    endpointCount: 16,
    popularity: 'featured',
    blueprint: BANKING_TEMPLATE,
  },
  {
    id: 'travel',
    name: 'Travel & Tourism',
    industry: 'Travel & Tourism',
    description: 'Travel platform with hotel booking, flight search, tour packages, itinerary planner, and local experiences.',
    tags: ['Travel', 'Hotel', 'Flights', 'Itinerary', 'Tourism'],
    icon: '✈️',
    screenCount: 8,
    tableCount: 6,
    endpointCount: 14,
    popularity: 'popular',
    blueprint: makeStub('TravelApp', 'Travel & Tourism', 'Travel & Tourism App', ['Traveler', 'Agent', 'Admin'], 8, 6, 14),
  },
];

// ─── Getters ──────────────────────────────────────────────────────────────────

export function getTemplateById(id: string): TemplatePackage | undefined {
  return TEMPLATE_REGISTRY.find(t => t.id === id);
}

export function getTemplatesByIndustry(industry: string): TemplatePackage[] {
  return TEMPLATE_REGISTRY.filter(t => t.industry === industry);
}

export function getFeaturedTemplates(): TemplatePackage[] {
  return TEMPLATE_REGISTRY.filter(t => t.popularity === 'featured');
}

export function getTrendingTemplates(): TemplatePackage[] {
  return TEMPLATE_REGISTRY.filter(t => t.popularity === 'trending');
}
