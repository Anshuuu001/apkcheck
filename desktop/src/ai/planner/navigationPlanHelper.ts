import type { ScreenBlueprint, NavigationPlan, NavigationGroup, NavigationRoute } from '../../blueprint/schema';

export function planNavigation(
  screens: ScreenBlueprint[],
  _industry: string,
  users: string[],
  _features: string[]
): NavigationPlan {
  // 1. Identify Entry screens
  const splash = screens.find(s => s.type === 'splash');
  const login = screens.find(s => s.type === 'auth' && s.name.toLowerCase().includes('login'));
  const home = screens.find(s => s.type === 'home');

  // 2. Identify Tab-eligible screens (screens with home/dashboard/list/settings/profile types)
  const tabScreens = screens.filter(s => 
    s.type === 'home' || 
    s.type === 'dashboard' || 
    s.type === 'list' || 
    s.type === 'profile' || 
    s.type === 'settings' ||
    s.type === 'notification' ||
    s.type === 'chat'
  ).slice(0, 5); // Max 5 bottom tabs

  const tabRoutes: NavigationRoute[] = tabScreens.map(s => {
    let icon = 'home';
    if (s.type === 'profile') icon = 'person';
    else if (s.type === 'settings') icon = 'settings';
    else if (s.type === 'notification') icon = 'notifications';
    else if (s.type === 'chat') icon = 'chatbubbles';
    else if (s.type === 'list') icon = 'list';
    
    return {
      name: s.name,
      screenId: s.id,
      label: s.title || s.name.replace('Screen', ''),
      icon
    };
  });

  const mainGroup: NavigationGroup = {
    id: 'main_tabs',
    type: 'tab',
    position: 'bottom',
    label: 'Main Navigation',
    userRoles: users,
    routes: tabRoutes,
    initialRoute: home ? home.name : (screens[0]?.name || '')
  };

  // 3. Stack group for remaining detailed/overlay screens
  const stackScreens = screens.filter(s => !tabScreens.some(ts => ts.id === s.id));
  const stackRoutes: NavigationRoute[] = stackScreens.map(s => ({
    name: s.name,
    screenId: s.id,
    label: s.title || s.name.replace('Screen', ''),
    icon: 'document'
  }));

  const stackGroup: NavigationGroup = {
    id: 'details_stack',
    type: 'stack',
    label: 'Flow Stack',
    userRoles: users,
    routes: stackRoutes,
    initialRoute: splash ? splash.name : (login ? login.name : (screens[0]?.name || ''))
  };

  return {
    type: tabRoutes.length > 1 ? 'hybrid' : 'stack-only',
    groups: [mainGroup, stackGroup],
    authFlow: {
      unauthenticatedEntry: login ? login.id : (screens[0]?.id || ''),
      authenticatedEntry: home ? home.id : (screens[0]?.id || ''),
      postLoginRedirect: home ? home.id : (screens[0]?.id || '')
    }
  };
}
