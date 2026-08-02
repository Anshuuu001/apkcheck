import type { IndustryType } from '../../blueprint/schema';

// ─── Industry Keyword Map ─────────────────────────────────────────────────────
export const INDUSTRY_KEYWORDS: Record<IndustryType, string[]> = {
  'Healthcare': ['hospital', 'doctor', 'patient', 'clinic', 'medical', 'health', 'pharmacy', 'medicine', 'appointment', 'prescription', 'nurse', 'ehr', 'telemedicine', 'ambulance', 'lab', 'diagnosis', 'bimar', 'ilaaj', 'dawa', 'doctor', 'hospital'],
  'Education': ['school', 'student', 'teacher', 'course', 'learning', 'class', 'university', 'college', 'exam', 'quiz', 'assignment', 'tutor', 'lms', 'e-learning', 'lecture', 'attendance', 'padhai', 'padhna', 'sikhna', 'teacher'],
  'E-Commerce': ['shop', 'store', 'product', 'cart', 'checkout', 'order', 'buy', 'sell', 'marketplace', 'ecommerce', 'inventory', 'catalog', 'payment', 'wishlist', 'delivery', 'merchant', 'dukaan', 'bikri', 'kharid', 'samaan'],
  'Food & Delivery': ['food', 'restaurant', 'delivery', 'meal', 'kitchen', 'menu', 'order', 'recipe', 'cuisine', 'chef', 'catering', 'grocery', 'snack', 'takeaway', 'uber eats', 'zomato', 'khana', 'peena', 'swiggy'],
  'Transportation': ['taxi', 'ride', 'driver', 'passenger', 'car', 'bus', 'bike', 'vehicle', 'route', 'gps', 'tracking', 'uber', 'ola', 'logistics', 'fleet', 'booking', 'transport', 'plumber', 'electrician', 'gaadi', 'kiraya', 'driver'],
  'Finance & Banking': ['bank', 'payment', 'wallet', 'transaction', 'money', 'loan', 'credit', 'debit', 'investment', 'stock', 'finance', 'budget', 'expense', 'insurance', 'fintech', 'savings', 'bookkeeping', 'paisa', 'bank', 'khata', 'bajat', 'rupiya'],
  'Real Estate': ['property', 'house', 'apartment', 'rent', 'buy', 'real estate', 'agent', 'listing', 'mortgage', 'home', 'building', 'plot', 'tenant', 'landlord', 'makaan', 'ghar', 'kiraye', 'zameen'],
  'Social Media': ['social', 'post', 'feed', 'follow', 'like', 'comment', 'share', 'story', 'reel', 'profile', 'friend', 'network', 'community', 'influencer', 'hashtag', 'dost', 'post', 'share'],
  'Fitness & Health': ['fitness', 'workout', 'gym', 'exercise', 'diet', 'calories', 'steps', 'weight', 'yoga', 'trainer', 'health', 'nutrition', 'meditation', 'sleep', 'run', 'sport', 'kasrat', 'vazan', 'sehat'],
  'Entertainment': ['movie', 'music', 'game', 'video', 'stream', 'podcast', 'book', 'show', 'ticket', 'event', 'concert', 'entertainment', 'play', 'download', 'media', 'film', 'gaana', 'khel'],
  'CRM & Business': ['crm', 'customer', 'lead', 'sales', 'marketing', 'business', 'company', 'employee', 'hr', 'payroll', 'invoice', 'client', 'report', 'analytics', 'dashboard', 'erp', 'vyapar', 'dhandha'],
  'Chat & Communication': ['chat', 'message', 'call', 'video call', 'voice', 'group', 'channel', 'notification', 'contact', 'inbox', 'communication', 'whatsapp', 'telegram', 'conference', 'baat', 'gupchup', 'chating'],
  'Travel & Tourism': ['travel', 'hotel', 'flight', 'trip', 'tour', 'booking', 'destination', 'vacation', 'ticket', 'passport', 'visa', 'itinerary', 'guide', 'resort', 'yatra', 'safar', 'ghumna'],
  'Agriculture': ['farm', 'crop', 'agriculture', 'farmer', 'harvest', 'soil', 'weather', 'irrigation', 'livestock', 'market price', 'agri', 'plantation', 'seed', 'kheti', 'kisaan', 'fasal', 'khet'],
  'Manufacturing': ['factory', 'production', 'machine', 'quality', 'inventory', 'supply chain', 'manufacturing', 'warehouse', 'assembly', 'maintenance', 'equipment', 'karkhana', 'maal'],
  'Custom': [],
};

export class DomainClassifier {
  classify(idea: string): { industry: IndustryType; confidence: number } {
    const lower = idea.toLowerCase();
    let best: IndustryType = 'Custom';
    let bestScore = 0;

    for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
      if (keywords.length === 0) continue;
      const matches = keywords.filter((kw) => lower.includes(kw));
      const score = matches.length / Math.max(1, keywords.length);
      
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

    const confidence = Math.min(1, bestScore * 8);

    if (confidence < 0.05) {
      return { industry: 'Custom', confidence: 0.1 };
    }
    
    return { industry: best, confidence };
  }
}
