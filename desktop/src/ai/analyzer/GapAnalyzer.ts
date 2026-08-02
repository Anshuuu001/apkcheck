/**
 * AppForge-AI — Gap Analyzer
 * 
 * Compares user-provided features against industry standards to identify
 * missing critical pieces, architectural gaps, and improvement opportunities.
 */

import type { IndustryType } from '../../blueprint/schema';
import { INDUSTRY_STANDARDS } from '../reasoning/DomainKnowledge';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GapItem {
  type: 'missing-feature' | 'security-gap' | 'ux-gap' | 'architecture-gap';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion: string;
}

// ─── Gap Analysis ────────────────────────────────────────────────────────────

export class GapAnalyzer {
  analyze(
    industry: IndustryType,
    userFeatures: string[],
    userRoles: string[],
    authRequired: boolean,
    paymentRequired: boolean
  ): GapItem[] {
    const standard = INDUSTRY_STANDARDS[industry] || INDUSTRY_STANDARDS['Custom'];
    const gaps: GapItem[] = [];

    // 1. Must-have feature gaps
    standard.mustHaveFeatures.forEach(feature => {
      if (!userFeatures.includes(feature)) {
        gaps.push({
          type: 'missing-feature',
          severity: 'critical',
          title: `Missing: ${feature}`,
          description: `"${feature}" is considered essential for ${industry} applications.`,
          suggestion: `Add "${feature}" to your feature list. Most competing apps include this.`,
        });
      }
    });

    // 2. Security gaps
    if (standard.dataPrivacyLevel === 'hipaa' && !userFeatures.includes('ehr')) {
      gaps.push({
        type: 'security-gap',
        severity: 'critical',
        title: 'HIPAA Compliance Required',
        description: 'Healthcare apps handling patient data must be HIPAA compliant.',
        suggestion: 'Implement data encryption, audit logging, and access controls.',
      });
    }

    if (standard.dataPrivacyLevel === 'pci-dss' && paymentRequired) {
      gaps.push({
        type: 'security-gap',
        severity: 'critical',
        title: 'PCI-DSS Compliance Required',
        description: 'Payment processing requires PCI-DSS compliance.',
        suggestion: 'Use a certified payment gateway (Stripe, Razorpay) instead of handling card data directly.',
      });
    }

    if (authRequired && !userFeatures.includes('biometric') && ['Finance & Banking', 'Healthcare'].includes(industry)) {
      gaps.push({
        type: 'security-gap',
        severity: 'warning',
        title: 'Biometric Authentication Recommended',
        description: `${industry} apps benefit from biometric login for enhanced security.`,
        suggestion: 'Add fingerprint/face ID authentication as a secondary auth method.',
      });
    }

    // 3. UX gaps
    if (!userFeatures.includes('notifications') && standard.commonFeatures.includes('notifications')) {
      gaps.push({
        type: 'ux-gap',
        severity: 'warning',
        title: 'No Push Notifications',
        description: 'Most modern apps use push notifications for engagement.',
        suggestion: 'Enable notifications for critical events (orders, appointments, messages).',
      });
    }

    if (userRoles.length > 2 && !userFeatures.includes('analytics')) {
      gaps.push({
        type: 'ux-gap',
        severity: 'info',
        title: 'No Admin Analytics',
        description: 'With multiple user roles, admin users typically need a dashboard.',
        suggestion: 'Add an analytics dashboard for admin/manager roles.',
      });
    }

    // 4. Architecture gaps
    if (standard.recommendedArchitecture === 'real-time' && !userFeatures.some(f => ['text_chat', 'gps_tracking', 'live'].includes(f))) {
      gaps.push({
        type: 'architecture-gap',
        severity: 'info',
        title: 'Real-time Architecture Recommended',
        description: `${industry} apps typically benefit from real-time data (WebSocket/SSE).`,
        suggestion: 'Consider WebSocket connections for live updates instead of polling.',
      });
    }

    if (standard.recommendedArchitecture === 'offline-first' && !userFeatures.includes('offline')) {
      gaps.push({
        type: 'architecture-gap',
        severity: 'warning',
        title: 'Offline Support Recommended',
        description: `${industry} users often have limited connectivity.`,
        suggestion: 'Implement local SQLite storage with background sync.',
      });
    }

    return gaps;
  }
}
