/**
 * AppForge-AI — Layout Template Registry
 */

import { DashboardLayout } from './DashboardLayout';
import { FormLayout } from './FormLayout';
import { ListLayout } from './ListLayout';
import { AnalyticsLayout } from './AnalyticsLayout';
import { EcommerceLayout } from './EcommerceLayout';
import { HospitalLayout } from './HospitalLayout';
import { ChatLayout } from './ChatLayout';
import { SocialLayout } from './SocialLayout';
import { ProfileLayout } from './ProfileLayout';
import { AuthLayout } from './AuthLayout';
import { LayoutTemplate } from './types';

export * from './types';
export {
  DashboardLayout,
  FormLayout,
  ListLayout,
  AnalyticsLayout,
  EcommerceLayout,
  HospitalLayout,
  ChatLayout,
  SocialLayout,
  ProfileLayout,
  AuthLayout
};

export const ALL_LAYOUTS: LayoutTemplate[] = [
  DashboardLayout,
  FormLayout,
  ListLayout,
  AnalyticsLayout,
  EcommerceLayout,
  HospitalLayout,
  ChatLayout,
  SocialLayout,
  ProfileLayout,
  AuthLayout,
];

/**
 * Select the best layout for a given screen type.
 */
export function selectLayout(screenType: string): LayoutTemplate {
  const typeMap: Record<string, string> = {
    'home': 'layout-dashboard',
    'dashboard': 'layout-dashboard',
    'list': 'layout-list',
    'detail': 'layout-form',
    'form': 'layout-form',
    'auth': 'layout-auth',
    'login': 'layout-auth',
    'signup': 'layout-auth',
    'profile': 'layout-profile',
    'settings': 'layout-profile',
    'chat': 'layout-chat',
    'report': 'layout-analytics',
    'analytics': 'layout-analytics',
    'checkout': 'layout-ecommerce',
    'shop': 'layout-ecommerce',
    'splash': 'layout-auth',
    'map': 'layout-dashboard',
    'notification': 'layout-list',
  };

  const layoutId = typeMap[screenType.toLowerCase()] || 'layout-dashboard';
  return ALL_LAYOUTS.find(l => l.id === layoutId) || DashboardLayout;
}
