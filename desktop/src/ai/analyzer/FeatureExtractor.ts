/**
 * AppForge-AI — Feature Extractor (V2 Analyzer)
 * 
 * Analyzes intent and parses feature dependencies like payments, location, notification, etc.
 */

import type { IndustryType } from '../../blueprint/schema';
import { INDUSTRY_FEATURES } from '../intentAnalyzer/localClassifier';

export class FeatureExtractor {
  extractFeatures(idea: string, industry: IndustryType): string[] {
    const lower = idea.toLowerCase();
    const suggestions = INDUSTRY_FEATURES[industry] || [];
    
    // Explicit scanning for common keywords
    const detected: string[] = [];

    if (lower.includes('pay') || lower.includes('bill') || lower.includes('invoice') || lower.includes('checkout') || lower.includes('stripe')) {
      detected.push('Payments');
    }
    if (lower.includes('gps') || lower.includes('location') || lower.includes('map') || lower.includes('route') || lower.includes('tracking')) {
      detected.push('GPS Tracking');
    }
    if (lower.includes('chat') || lower.includes('message') || lower.includes('sms') || lower.includes('discussion')) {
      detected.push('Real-time Chat');
    }
    if (lower.includes('notify') || lower.includes('alert') || lower.includes('push') || lower.includes('reminder')) {
      detected.push('Push Notifications');
    }
    if (lower.includes('camera') || lower.includes('photo') || lower.includes('scan') || lower.includes('qr')) {
      detected.push('Camera & Media');
    }

    // Add suggested industry features that match keywords in lower prompt
    suggestions.forEach(feat => {
      const kw = feat.toLowerCase();
      if (lower.includes(kw) && !detected.includes(feat)) {
        detected.push(feat);
      }
    });

    // If we didn't detect anything, return standard defaults for the industry
    if (detected.length === 0) {
      return suggestions.slice(0, 4);
    }

    return Array.from(new Set(detected));
  }
}
