import type { IntentResult, IndustryType } from '../../blueprint/schema';

// ─── Industry Keyword Map ─────────────────────────────────────────────────────

export const INDUSTRY_KEYWORDS: Record<IndustryType, string[]> = {
  'Healthcare': ['hospital', 'doctor', 'patient', 'clinic', 'medical', 'health', 'pharmacy', 'medicine', 'appointment', 'prescription', 'nurse', 'ehr', 'telemedicine', 'ambulance', 'lab', 'diagnosis'],
  'Education': ['school', 'student', 'teacher', 'course', 'learning', 'class', 'university', 'college', 'exam', 'quiz', 'assignment', 'tutor', 'lms', 'e-learning', 'lecture', 'attendance'],
  'E-Commerce': ['shop', 'store', 'product', 'cart', 'checkout', 'order', 'buy', 'sell', 'marketplace', 'ecommerce', 'inventory', 'catalog', 'payment', 'wishlist', 'delivery', 'merchant'],
  'Food & Delivery': ['food', 'restaurant', 'delivery', 'meal', 'kitchen', 'menu', 'order', 'recipe', 'cuisine', 'chef', 'catering', 'grocery', 'snack', 'takeaway', 'uber eats', 'zomato'],
  'Transportation': ['taxi', 'ride', 'driver', 'passenger', 'car', 'bus', 'bike', 'vehicle', 'route', 'gps', 'tracking', 'uber', 'ola', 'logistics', 'fleet', 'booking', 'transport', 'plumber', 'electrician'],
  'Finance & Banking': ['bank', 'payment', 'wallet', 'transaction', 'money', 'loan', 'credit', 'debit', 'investment', 'stock', 'finance', 'budget', 'expense', 'insurance', 'fintech', 'savings', 'bookkeeping'],
  'Real Estate': ['property', 'house', 'apartment', 'rent', 'buy', 'real estate', 'agent', 'listing', 'mortgage', 'home', 'building', 'plot', 'tenant', 'landlord'],
  'Social Media': ['social', 'post', 'feed', 'follow', 'like', 'comment', 'share', 'story', 'reel', 'profile', 'friend', 'network', 'community', 'influencer', 'hashtag'],
  'Fitness & Health': ['fitness', 'workout', 'gym', 'exercise', 'diet', 'calories', 'steps', 'weight', 'yoga', 'trainer', 'health', 'nutrition', 'meditation', 'sleep', 'run', 'sport'],
  'Entertainment': ['movie', 'music', 'game', 'video', 'stream', 'podcast', 'book', 'show', 'ticket', 'event', 'concert', 'entertainment', 'play', 'download', 'media'],
  'CRM & Business': ['crm', 'customer', 'lead', 'sales', 'marketing', 'business', 'company', 'employee', 'hr', 'payroll', 'invoice', 'client', 'report', 'analytics', 'dashboard', 'erp'],
  'Chat & Communication': ['chat', 'message', 'call', 'video call', 'voice', 'group', 'channel', 'notification', 'contact', 'inbox', 'communication', 'whatsapp', 'telegram', 'conference'],
  'Travel & Tourism': ['travel', 'hotel', 'flight', 'trip', 'tour', 'booking', 'destination', 'vacation', 'ticket', 'passport', 'visa', 'itinerary', 'guide', 'resort'],
  'Agriculture': ['farm', 'crop', 'agriculture', 'farmer', 'harvest', 'soil', 'weather', 'irrigation', 'livestock', 'market price', 'agri', 'plantation', 'seed'],
  'Manufacturing': ['factory', 'production', 'machine', 'quality', 'inventory', 'supply chain', 'manufacturing', 'warehouse', 'assembly', 'maintenance', 'equipment'],
  'Custom': [],
};

// ─── Role Suggestions by Industry ────────────────────────────────────────────

export const INDUSTRY_ROLES: Record<IndustryType, string[]> = {
  'Healthcare': ['Doctor', 'Patient', 'Admin', 'Nurse', 'Pharmacist', 'Receptionist'],
  'Education': ['Student', 'Teacher', 'Admin', 'Parent', 'Principal'],
  'E-Commerce': ['Customer', 'Seller', 'Admin', 'Delivery Agent'],
  'Food & Delivery': ['Customer', 'Restaurant Owner', 'Delivery Driver', 'Admin'],
  'Transportation': ['Passenger', 'Driver', 'Admin', 'Dispatcher'],
  'Finance & Banking': ['Customer', 'Bank Agent', 'Admin', 'Auditor'],
  'Real Estate': ['Buyer', 'Seller', 'Agent', 'Admin'],
  'Social Media': ['User', 'Creator', 'Moderator', 'Admin'],
  'Fitness & Health': ['Member', 'Trainer', 'Admin', 'Nutritionist'],
  'Entertainment': ['User', 'Creator', 'Moderator', 'Admin'],
  'CRM & Business': ['Sales Rep', 'Manager', 'Customer', 'Admin'],
  'Chat & Communication': ['User', 'Admin', 'Moderator'],
  'Travel & Tourism': ['Traveler', 'Agent', 'Hotel Manager', 'Admin'],
  'Agriculture': ['Farmer', 'Buyer', 'Expert', 'Admin'],
  'Manufacturing': ['Worker', 'Manager', 'Quality Inspector', 'Admin'],
  'Custom': ['User', 'Admin'],
};

// ─── Feature Suggestions by Industry ─────────────────────────────────────────

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

// ─── Detect Industry ──────────────────────────────────────────────────────────

export function detectIndustry(idea: string): { industry: IndustryType; confidence: number } {
  const lower = idea.toLowerCase();
  let best: IndustryType = 'Custom';
  let bestScore = 0;

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.length === 0) continue;
    const matches = keywords.filter((kw) => lower.includes(kw));
    // Calculate fractional score
    const score = matches.length / Math.max(1, keywords.length);
    // Give weight if exact matching expressions are found
    let boost = 0;
    if (industry === 'Transportation' && (lower.includes('plumber') || lower.includes('electrician') || lower.includes('uber for'))) {
      boost = 0.5;
    }
    if (industry === 'Finance & Banking' && lower.includes('bookkeeping')) {
      boost = 0.5;
    }

    const finalScore = score + boost;
    if (finalScore > bestScore) {
      bestScore = finalScore;
      best = industry as IndustryType;
    }
  }

  return { industry: best, confidence: Math.min(1, bestScore * 8) };
}

// ─── Derive App Type Name ─────────────────────────────────────────────────────

export function deriveAppType(idea: string, industry: IndustryType): string {
  const lower = idea.toLowerCase();

  const typePatterns: [string, string][] = [
    ['management system', 'Management System'],
    ['management app', 'Management App'],
    ['booking app', 'Booking App'],
    ['delivery app', 'Delivery App'],
    ['tracking app', 'Tracking App'],
    ['marketplace', 'Marketplace'],
    ['social app', 'Social App'],
    ['chat app', 'Chat App'],
    ['fitness app', 'Fitness App'],
    ['e-commerce', 'E-Commerce App'],
    ['crm', 'CRM System'],
    ['erp', 'ERP System'],
    ['portal', 'Portal'],
    ['platform', 'Platform'],
    ['dashboard', 'Dashboard App'],
    ['tool', 'Tool'],
  ];

  for (const [pattern, label] of typePatterns) {
    if (lower.includes(pattern)) return `${industry} ${label}`;
  }

  return `${industry} Application`;
}

// ─── Extract Goal ─────────────────────────────────────────────────────────────

export function extractGoal(industry: IndustryType): string {
  const features = INDUSTRY_FEATURES[industry];
  if (features.length === 0) return 'Build a custom mobile application';
  return `${features.slice(0, 3).join(', ')} and more`;
}

// ─── Local Analysis ──────────────────────────────────────────────────────────

export function analyzeIntentLocally(idea: string): IntentResult {
  const { industry, confidence } = detectIndustry(idea);
  const appType = deriveAppType(idea, industry);
  const targetUsers = INDUSTRY_ROLES[industry].slice(0, 3);
  const primaryGoal = extractGoal(industry);
  const suggestedFeatures = INDUSTRY_FEATURES[industry].slice(0, 6);

  return {
    industry,
    appType,
    targetUsers,
    primaryGoal,
    suggestedFeatures,
    confidence: confidence || 0.5,
    rawIdea: idea,
  };
}
