export interface MarketplaceItem {
  id: string;
  name: string;
  category: 'plugin' | 'component' | 'theme' | 'template';
  description: string;
  version: string;
  author: string;
  downloadsCount: number;
  rating: number;
}

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'firebase-auth',
    name: 'Firebase Auth Plugin',
    category: 'plugin',
    description: 'One-click email/password and Google authentication via Firebase integration.',
    version: '1.2.0',
    author: 'AppForge Team',
    downloadsCount: 1450,
    rating: 4.8
  },
  {
    id: 'supabase-db',
    name: 'Supabase Data Connector',
    category: 'plugin',
    description: 'Postgres database synchronizer and user permissions broker.',
    version: '1.0.5',
    author: 'Community Core',
    downloadsCount: 920,
    rating: 4.6
  },
  {
    id: 'stripe-checkout',
    name: 'Stripe Pay Component',
    category: 'component',
    description: 'Pre-formatted secure card credit processing widget.',
    version: '2.0.1',
    author: 'Stripe Official',
    downloadsCount: 2310,
    rating: 4.9
  },
  {
    id: 'charts-bundle',
    name: 'Neumorphic Dashboard Charts',
    category: 'theme',
    description: 'Modern glassmorphism charts and graphs UI theme tokens.',
    version: '1.0.0',
    author: 'DesignPro',
    downloadsCount: 650,
    rating: 4.5
  }
];

export function searchMarketplace(query: string): MarketplaceItem[] {
  const q = query.toLowerCase();
  return MARKETPLACE_ITEMS.filter(item => 
    item.name.toLowerCase().includes(q) || 
    item.description.toLowerCase().includes(q)
  );
}
