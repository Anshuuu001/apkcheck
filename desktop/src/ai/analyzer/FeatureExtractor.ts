import type { IndustryType } from '../../blueprint/schema';

export const INDUSTRY_FEATURES: Record<IndustryType, string[]> = {
  'Healthcare': ['Appointment Booking', 'Patient Records', 'Prescription Management', 'Billing', 'Lab Reports', 'Video Consultation', 'Notifications'],
  'Education': ['Course Management', 'Live Classes', 'Assignments', 'Quizzes', 'Attendance', 'Grades', 'Notifications', 'Chat'],
  'E-Commerce': ['Product Catalog', 'Shopping Cart', 'Checkout', 'Order Tracking', 'Reviews & Ratings', 'Wishlist', 'Search', 'Notifications'],
  'Food & Delivery': ['Restaurant Listing', 'Menu', 'Cart', 'Order Tracking', 'GPS Tracking', 'Reviews', 'Payment', 'Notifications'],
  'Transportation': ['Ride Booking', 'Driver Matching', 'GPS Tracking', 'Fare Estimation', 'Payment', 'Rating', 'History', 'Notifications'],
  'Finance & Banking': ['Account Management', 'Transactions', 'Transfer', 'Bill Payment', 'Statements', 'Notifications', 'Analytics'],
  'Real Estate': ['Property Listing', 'Search & Filter', 'Virtual Tour', 'Contact Agent', 'Favorites', 'Map View', 'Notifications'],
  'Social Media': ['Feed', 'Post Creation', 'Follow/Unfollow', 'Stories', 'Direct Messages', 'Notifications', 'Search'],
  'Fitness & Health': ['Workout Plans', 'Progress Tracking', 'Diet & Nutrition', 'Step Counter', 'Goals', 'Trainer Chat', 'Notifications'],
  'Entertainment': ['Content Library', 'Search', 'Favorites', 'Download', 'Reviews', 'Recommendations', 'Notifications'],
  'CRM & Business': ['Lead Management', 'Contact Management', 'Analytics Dashboard', 'Task Management', 'Reports', 'Notifications'],
  'Chat & Communication': ['Real-time Messaging', 'Group Chat', 'File Sharing', 'Voice/Video Call', 'Status', 'Notifications'],
  'Travel & Tourism': ['Destination Search', 'Hotel Booking', 'Flight Booking', 'Itinerary', 'Reviews', 'Map Integration', 'Notifications'],
  'Agriculture': ['Crop Management', 'Weather Updates', 'Market Prices', 'Expert Consultation', 'Notifications'],
  'Manufacturing': ['Production Tracking', 'Quality Control', 'Inventory', 'Maintenance Logs', 'Reports', 'Notifications'],
  'Custom': ['Authentication', 'Dashboard', 'Settings', 'Notifications', 'Profile'],
};

export class FeatureExtractor {
  extractFeatures(idea: string, industry: IndustryType): string[] {
    const lower = idea.toLowerCase();
    const suggestions = INDUSTRY_FEATURES[industry] || [];
    
    // Explicit scanning for common keywords
    const detected: string[] = [];

    if (lower.includes('pay') || lower.includes('bill') || lower.includes('invoice') || lower.includes('checkout') || lower.includes('stripe')) {
      detected.push('payments');
    }
    if (lower.includes('gps') || lower.includes('location') || lower.includes('map') || lower.includes('route') || lower.includes('tracking')) {
      detected.push('gps_tracking');
    }
    if (lower.includes('chat') || lower.includes('message') || lower.includes('sms') || lower.includes('discussion')) {
      detected.push('text_chat');
    }
    if (lower.includes('notify') || lower.includes('alert') || lower.includes('push') || lower.includes('reminder')) {
      detected.push('notifications');
    }
    if (lower.includes('camera') || lower.includes('photo') || lower.includes('scan') || lower.includes('qr')) {
      detected.push('camera');
    }

    // Add suggested industry features that match keywords in lower prompt
    suggestions.forEach(feat => {
      const kw = feat.toLowerCase();
      if (lower.includes(kw) && !detected.includes(feat)) {
        // Map feature name to unified lowercase format where appropriate
        let unifiedFeat = feat;
        if (kw === 'billing' || kw === 'payment') unifiedFeat = 'payments';
        else if (kw === 'notifications') unifiedFeat = 'notifications';
        else if (kw === 'appointments') unifiedFeat = 'appointments';
        else if (kw === 'prescriptions') unifiedFeat = 'prescriptions';
        else if (kw === 'catalog') unifiedFeat = 'catalog';
        else if (kw === 'cart') unifiedFeat = 'cart';
        else if (kw === 'chat') unifiedFeat = 'text_chat';
        else if (kw === 'restaurants') unifiedFeat = 'restaurants';
        else if (kw === 'gps tracking' || kw === 'live tracking' || kw === 'order tracking') unifiedFeat = 'gps_tracking';
        else if (kw === 'analytics') unifiedFeat = 'analytics';

        detected.push(unifiedFeat);
      }
    });

    // If we didn't detect anything, return standard defaults for the industry
    if (detected.length === 0) {
      return suggestions.slice(0, 4).map(f => f.toLowerCase().replace(/\s+/g, '_'));
    }

    return Array.from(new Set(detected));
  }
}
