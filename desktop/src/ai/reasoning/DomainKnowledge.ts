/**
 * AppForge-AI — Domain Knowledge Base
 * 
 * Static knowledge repository of industry patterns, standard features,
 * regulatory requirements, and architectural best practices for each IndustryType.
 */

import type { IndustryType } from '../../blueprint/schema';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DomainInsight {
  category: string;
  insight: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface IndustryStandard {
  mustHaveFeatures: string[];
  commonFeatures: string[];
  regulatoryRequirements: string[];
  typicalUserRoles: string[];
  recommendedArchitecture: 'real-time' | 'rest-api' | 'offline-first' | 'hybrid';
  dataPrivacyLevel: 'standard' | 'sensitive' | 'hipaa' | 'pci-dss';
  typicalScreenCount: { min: number; max: number };
}

// ─── Industry Knowledge Map ──────────────────────────────────────────────────

export const INDUSTRY_STANDARDS: Record<IndustryType, IndustryStandard> = {
  'Healthcare': {
    mustHaveFeatures: ['appointments', 'profiles', 'notifications'],
    commonFeatures: ['prescriptions', 'ehr', 'lab_reports', 'billing', 'teleconsult', 'analytics'],
    regulatoryRequirements: ['HIPAA compliance', 'Data encryption at rest', 'Audit trail logging', 'Patient consent management'],
    typicalUserRoles: ['Doctor', 'Patient', 'Admin', 'Nurse', 'Pharmacist'],
    recommendedArchitecture: 'hybrid',
    dataPrivacyLevel: 'hipaa',
    typicalScreenCount: { min: 8, max: 20 },
  },
  'E-Commerce': {
    mustHaveFeatures: ['catalog', 'cart', 'profiles'],
    commonFeatures: ['wishlist', 'reviews', 'order_tracking', 'coupons', 'analytics', 'notifications'],
    regulatoryRequirements: ['PCI-DSS for payments', 'GDPR data handling', 'Return policy display'],
    typicalUserRoles: ['Customer', 'Admin', 'Seller'],
    recommendedArchitecture: 'rest-api',
    dataPrivacyLevel: 'pci-dss',
    typicalScreenCount: { min: 7, max: 15 },
  },
  'Education': {
    mustHaveFeatures: ['profiles', 'notifications'],
    commonFeatures: ['live_classes', 'quizzes', 'assignments', 'attendance', 'grades', 'fees', 'video_library'],
    regulatoryRequirements: ['COPPA for minors', 'Accessibility standards', 'Content moderation'],
    typicalUserRoles: ['Student', 'Teacher', 'Admin', 'Parent'],
    recommendedArchitecture: 'hybrid',
    dataPrivacyLevel: 'sensitive',
    typicalScreenCount: { min: 6, max: 14 },
  },
  'Food & Delivery': {
    mustHaveFeatures: ['restaurants', 'cart', 'gps_tracking'],
    commonFeatures: ['menu', 'reviews', 'loyalty', 'scheduled', 'notifications', 'driver'],
    regulatoryRequirements: ['Food safety labeling', 'Delivery time SLA'],
    typicalUserRoles: ['Customer', 'Restaurant', 'Driver', 'Admin'],
    recommendedArchitecture: 'real-time',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 8, max: 16 },
  },
  'Transportation': {
    mustHaveFeatures: ['gps_tracking', 'profiles'],
    commonFeatures: ['taxi', 'carpool', 'notifications', 'analytics'],
    regulatoryRequirements: ['Driver license verification', 'Insurance tracking', 'Safety compliance'],
    typicalUserRoles: ['Rider', 'Driver', 'Admin'],
    recommendedArchitecture: 'real-time',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 6, max: 12 },
  },
  'Finance & Banking': {
    mustHaveFeatures: ['dashboard', 'profiles', 'notifications'],
    commonFeatures: ['transfer', 'bill_pay', 'investments', 'expense', 'loans', 'kyc', 'biometric'],
    regulatoryRequirements: ['PCI-DSS', 'KYC/AML compliance', 'Two-factor authentication mandatory', 'Transaction logging'],
    typicalUserRoles: ['Customer', 'Admin', 'Support'],
    recommendedArchitecture: 'rest-api',
    dataPrivacyLevel: 'pci-dss',
    typicalScreenCount: { min: 8, max: 18 },
  },
  'Social Media': {
    mustHaveFeatures: ['feed', 'profiles', 'notifications'],
    commonFeatures: ['stories', 'reels', 'dm', 'groups', 'live', 'marketplace'],
    regulatoryRequirements: ['Content moderation', 'GDPR data export', 'Age verification', 'Report/Block system'],
    typicalUserRoles: ['User', 'Admin', 'Moderator'],
    recommendedArchitecture: 'real-time',
    dataPrivacyLevel: 'sensitive',
    typicalScreenCount: { min: 8, max: 20 },
  },
  'Real Estate': {
    mustHaveFeatures: ['listings', 'profiles'],
    commonFeatures: ['map', 'virtual_tour', 'agents', 'emi', 'favorites', 'documents'],
    regulatoryRequirements: ['RERA compliance', 'Document verification'],
    typicalUserRoles: ['Buyer', 'Seller', 'Agent', 'Admin'],
    recommendedArchitecture: 'rest-api',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 6, max: 14 },
  },
  'Fitness & Health': {
    mustHaveFeatures: ['workouts', 'progress', 'profiles'],
    commonFeatures: ['nutrition', 'steps', 'trainer_chat', 'wearable', 'meditation', 'class_booking'],
    regulatoryRequirements: ['Health data privacy', 'Wearable API compliance'],
    typicalUserRoles: ['User', 'Trainer', 'Admin'],
    recommendedArchitecture: 'hybrid',
    dataPrivacyLevel: 'sensitive',
    typicalScreenCount: { min: 6, max: 14 },
  },
  'Entertainment': {
    mustHaveFeatures: ['profiles', 'notifications'],
    commonFeatures: ['video_streaming', 'music_streaming', 'podcasts', 'tickets'],
    regulatoryRequirements: ['DRM content protection', 'Age-gated content', 'Licensing compliance'],
    typicalUserRoles: ['User', 'Creator', 'Admin'],
    recommendedArchitecture: 'rest-api',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 5, max: 12 },
  },
  'Chat & Communication': {
    mustHaveFeatures: ['text_chat', 'profiles', 'notifications'],
    commonFeatures: ['group_chat', 'voice', 'video', 'files', 'e2e', 'channels', 'bots'],
    regulatoryRequirements: ['End-to-end encryption option', 'Message retention policies', 'GDPR right to deletion'],
    typicalUserRoles: ['User', 'Admin', 'Bot'],
    recommendedArchitecture: 'real-time',
    dataPrivacyLevel: 'sensitive',
    typicalScreenCount: { min: 5, max: 10 },
  },
  'CRM & Business': {
    mustHaveFeatures: ['leads', 'contacts', 'profiles'],
    commonFeatures: ['pipeline', 'tasks', 'invoicing', 'reports', 'email', 'collaboration'],
    regulatoryRequirements: ['Data export capability', 'Role-based access control'],
    typicalUserRoles: ['Sales Rep', 'Manager', 'Admin'],
    recommendedArchitecture: 'rest-api',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 7, max: 16 },
  },
  'Travel & Tourism': {
    mustHaveFeatures: ['profiles', 'notifications'],
    commonFeatures: ['hotels', 'flights', 'packages', 'itinerary', 'experiences', 'reviews', 'currency'],
    regulatoryRequirements: ['Booking cancellation policies', 'Payment gateway compliance'],
    typicalUserRoles: ['Traveler', 'Host', 'Admin'],
    recommendedArchitecture: 'rest-api',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 6, max: 14 },
  },
  'Agriculture': {
    mustHaveFeatures: ['profiles'],
    commonFeatures: ['crops', 'weather', 'prices', 'experts', 'soil', 'marketplace'],
    regulatoryRequirements: ['Local language support', 'Offline capability recommended'],
    typicalUserRoles: ['Farmer', 'Expert', 'Admin', 'Buyer'],
    recommendedArchitecture: 'offline-first',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 5, max: 10 },
  },
  'Manufacturing': {
    mustHaveFeatures: ['profiles', 'notifications'],
    commonFeatures: ['production', 'quality', 'inventory', 'maintenance', 'attendance', 'shipment'],
    regulatoryRequirements: ['ISO compliance tracking', 'Safety incident logging'],
    typicalUserRoles: ['Worker', 'Supervisor', 'Manager', 'Admin'],
    recommendedArchitecture: 'hybrid',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 6, max: 12 },
  },
  'Custom': {
    mustHaveFeatures: ['profiles'],
    commonFeatures: ['dashboard', 'search', 'chat', 'payments', 'files', 'maps', 'analytics'],
    regulatoryRequirements: [],
    typicalUserRoles: ['User', 'Admin'],
    recommendedArchitecture: 'rest-api',
    dataPrivacyLevel: 'standard',
    typicalScreenCount: { min: 4, max: 12 },
  },
};

/**
 * Returns domain-specific insights for a given industry.
 */
export function getDomainInsights(industry: IndustryType, userFeatures: string[]): DomainInsight[] {
  const standard = INDUSTRY_STANDARDS[industry] || INDUSTRY_STANDARDS['Custom'];
  const insights: DomainInsight[] = [];

  // Check if must-have features are being requested
  standard.mustHaveFeatures.forEach(feature => {
    if (!userFeatures.includes(feature)) {
      insights.push({
        category: 'Missing Critical Feature',
        insight: `"${feature}" is a must-have for ${industry} apps but was not mentioned.`,
        importance: 'critical',
      });
    }
  });

  // Suggest common features the user didn't mention
  standard.commonFeatures.forEach(feature => {
    if (!userFeatures.includes(feature)) {
      insights.push({
        category: 'Suggested Feature',
        insight: `"${feature}" is commonly found in ${industry} apps. Consider including it.`,
        importance: 'medium',
      });
    }
  });

  // Regulatory warnings
  standard.regulatoryRequirements.forEach(req => {
    insights.push({
      category: 'Regulatory',
      insight: req,
      importance: 'high',
    });
  });

  return insights;
}
