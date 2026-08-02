import type { LayoutTemplate } from './types';

export const SocialLayout: LayoutTemplate = {
  id: 'layout-social',
  name: 'Social Feed',
  description: 'Stories row, feed cards, bottom nav',
  category: 'social',
  slots: [
    { id: 'header', name: 'App Header', position: 'top', flex: 0, acceptsComponents: ['TopBar'], defaultComponent: 'TopBar' },
    { id: 'stories', name: 'Stories Row', position: 'top', flex: 0, acceptsComponents: ['StoriesRow', 'AvatarRow'], defaultComponent: 'StoriesRow' },
    { id: 'feed', name: 'Feed Content', position: 'center', flex: 5, acceptsComponents: ['FeedCard', 'PostCard', 'Card'], defaultComponent: 'FeedCard' },
    { id: 'bottomNav', name: 'Bottom Navigation', position: 'bottom', flex: 0, acceptsComponents: ['BottomNavigation'], defaultComponent: 'BottomNavigation' },
  ],
  defaultComponents: ['TopBar', 'StoriesRow', 'FeedCard', 'BottomNavigation'],
};
