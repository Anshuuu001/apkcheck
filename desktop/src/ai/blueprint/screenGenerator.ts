import type { ScreenBlueprint, IndustryType } from '../../blueprint/schema';
import { generateId } from '../../blueprint/parser';

export function buildScreensFromFeatures(
  features: string[],
  users: string[],
  _industry: IndustryType,
  authRequired: boolean
): ScreenBlueprint[] {
  const screens: ScreenBlueprint[] = [];
  let order = 0;

  const addScreen = (template: Omit<ScreenBlueprint, 'id'>) => {
    screens.push({ id: generateId('screen'), ...template });
    order++;
  };

  // Always add splash + onboarding for auth apps
  if (authRequired) {
    addScreen({
      name: 'SplashScreen', type: 'splash', title: 'Splash', route: '/splash',
      description: 'App launch screen with logo and branding',
      userRoles: users, components: [
        { id: generateId('c'), type: 'Container', label: 'Splash Container', props: { centered: true }, children: [
          { id: generateId('c'), type: 'Image', label: 'App Logo', props: { size: 120, centered: true } },
          { id: generateId('c'), type: 'Heading', label: 'App Name', props: { level: 'h1' } },
          { id: generateId('c'), type: 'LoadingSpinner', label: 'Loading', props: { size: 'small' } },
        ]},
      ]
    });

    addScreen({
      name: 'LoginScreen', type: 'auth', title: 'Sign In', route: '/login',
      description: 'Email and password login with social auth options',
      userRoles: users, components: [
        { id: generateId('c'), type: 'Container', label: 'Auth Container', props: {}, children: [
          { id: generateId('c'), type: 'Heading', label: 'Welcome Back', props: { level: 'h2' } },
          { id: generateId('c'), type: 'TextField', label: 'Email', props: { placeholder: 'Enter email', keyboardType: 'email' } },
          { id: generateId('c'), type: 'PasswordField', label: 'Password', props: { placeholder: 'Enter password' } },
          { id: generateId('c'), type: 'Button', label: 'Sign In', props: { variant: 'primary', fullWidth: true }, eventHandlers: { onPress: 'auth:login' } },
          { id: generateId('c'), type: 'SocialAuthButton', label: 'Continue with Google', props: { provider: 'google' } },
        ]},
      ], guards: []
    });

    addScreen({
      name: 'SignupScreen', type: 'auth', title: 'Create Account', route: '/signup',
      description: 'New user registration with role selection',
      userRoles: users, components: [
        { id: generateId('c'), type: 'Container', label: 'Signup Container', props: {}, children: [
          { id: generateId('c'), type: 'Heading', label: 'Create Account', props: { level: 'h2' } },
          { id: generateId('c'), type: 'TextField', label: 'Full Name', props: { placeholder: 'Your name' } },
          { id: generateId('c'), type: 'TextField', label: 'Email', props: { placeholder: 'Email address' } },
          { id: generateId('c'), type: 'PasswordField', label: 'Password', props: { placeholder: 'Create password' } },
          { id: generateId('c'), type: 'Button', label: 'Create Account', props: { variant: 'primary', fullWidth: true }, eventHandlers: { onPress: 'auth:register' } },
        ]},
      ], guards: []
    });
  }

  // Home / Dashboard
  addScreen({
    name: 'HomeScreen', type: 'home', title: 'Home', route: '/home',
    description: 'Main home screen with quick actions and summary',
    userRoles: users, components: [
      { id: generateId('c'), type: 'TopBar', label: 'Header', props: { title: 'Home', showMenu: true } },
      { id: generateId('c'), type: 'ScrollView', label: 'Home Content', props: {}, children: [
        { id: generateId('c'), type: 'Card', label: 'Welcome Card', props: { elevation: 'md' } },
        { id: generateId('c'), type: 'Row', label: 'Quick Actions', props: { gap: 12 } },
        { id: generateId('c'), type: 'StatCard', label: 'Summary Stats', props: {} },
      ]},
    ], guards: authRequired ? ['isAuthenticated'] : []
  });

  // Feature-specific screens
  const featureScreenMap: Record<string, ScreenBlueprint[]> = {
    // Healthcare
    appointments: [{
      id: generateId('screen'), name: 'AppointmentsScreen', type: 'list', title: 'Appointments',
      route: '/appointments', description: 'View and manage appointments',
      userRoles: users, guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Appointments Header', props: { title: 'Appointments' } },
        { id: generateId('c'), type: 'Calendar', label: 'Appointment Calendar', props: {} },
        { id: generateId('c'), type: 'ListItem', label: 'Appointment Items', props: {} },
      ], apiCalls: ['getAppointments', 'bookAppointment']
    }],
    prescriptions: [{
      id: generateId('screen'), name: 'PrescriptionsScreen', type: 'list', title: 'Prescriptions',
      route: '/prescriptions', description: 'View and manage prescriptions',
      userRoles: users, guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Prescriptions Header', props: { title: 'Prescriptions' } },
        { id: generateId('c'), type: 'SearchBar', label: 'Search Prescriptions', props: {} },
        { id: generateId('c'), type: 'Card', label: 'Prescription Card', props: {} },
      ], apiCalls: ['getPrescriptions']
    }],
    billing: [{
      id: generateId('screen'), name: 'BillingScreen', type: 'list', title: 'Billing',
      route: '/billing', description: 'View bills and payment history',
      userRoles: users, guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Billing Header', props: { title: 'Billing' } },
        { id: generateId('c'), type: 'StatCard', label: 'Payment Summary', props: {} },
        { id: generateId('c'), type: 'Table', label: 'Bills Table', props: {} },
      ], apiCalls: ['getBills', 'createInvoice']
    }],

    // E-Commerce
    catalog: [{
      id: generateId('screen'), name: 'ProductsScreen', type: 'list', title: 'Products',
      route: '/products', description: 'Browse product catalog',
      userRoles: users, guards: [], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Shop Header', props: { title: 'Shop', showCart: true } },
        { id: generateId('c'), type: 'SearchBar', label: 'Search Products', props: {} },
        { id: generateId('c'), type: 'Grid', label: 'Product Grid', props: { columns: 2 }, children: [
          { id: generateId('c'), type: 'ProductCard', label: 'Product Item', props: {} },
        ]},
      ], apiCalls: ['getProducts', 'searchProducts']
    }],
    cart: [{
      id: generateId('screen'), name: 'CartScreen', type: 'checkout', title: 'Cart',
      route: '/cart', description: 'Shopping cart and checkout',
      userRoles: users, guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Cart Header', props: { title: 'My Cart' } },
        { id: generateId('c'), type: 'CartItem', label: 'Cart Items', props: {} },
        { id: generateId('c'), type: 'OrderSummary', label: 'Order Summary', props: {} },
        { id: generateId('c'), type: 'PaymentForm', label: 'Payment', props: {} },
        { id: generateId('c'), type: 'Button', label: 'Place Order', props: { variant: 'primary', fullWidth: true } },
      ], apiCalls: ['getCart', 'checkout']
    }],

    // Chat
    text_chat: [{
      id: generateId('screen'), name: 'ChatScreen', type: 'chat', title: 'Messages',
      route: '/chat', description: 'Real-time messaging',
      userRoles: users, guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Chat Header', props: { title: 'Messages' } },
        { id: generateId('c'), type: 'MessageList', label: 'Messages', props: {} },
        { id: generateId('c'), type: 'ChatInput', label: 'Message Input', props: {} },
      ], apiCalls: ['getMessages', 'sendMessage']
    }],

    // Food delivery
    restaurants: [{
      id: generateId('screen'), name: 'RestaurantsScreen', type: 'list', title: 'Restaurants',
      route: '/restaurants', description: 'Browse nearby restaurants',
      userRoles: users, guards: [], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Restaurants Header', props: { title: 'Order Food', showLocation: true } },
        { id: generateId('c'), type: 'SearchBar', label: 'Search Restaurants', props: {} },
        { id: generateId('c'), type: 'Card', label: 'Restaurant Card', props: {} },
      ], apiCalls: ['getRestaurants']
    }],
    gps_tracking: [{
      id: generateId('screen'), name: 'TrackingScreen', type: 'map', title: 'Track Order',
      route: '/tracking/:orderId', description: 'Real-time delivery tracking',
      userRoles: users, guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'MapView', label: 'Delivery Map', props: { showRoute: true } },
        { id: generateId('c'), type: 'BottomSheet', label: 'Order Status', props: {} },
      ], apiCalls: ['trackOrder'], params: [{ name: 'orderId', type: 'string' }]
    }],

    // Analytics
    analytics: [{
      id: generateId('screen'), name: 'AnalyticsScreen', type: 'report', title: 'Analytics',
      route: '/analytics', description: 'Performance dashboard and reports',
      userRoles: users.filter(u => u.toLowerCase() === 'admin' || u.toLowerCase() === 'manager').length > 0
        ? users.filter(u => u.toLowerCase() === 'admin' || u.toLowerCase() === 'manager')
        : users,
      guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Analytics Header', props: { title: 'Analytics' } },
        { id: generateId('c'), type: 'StatCard', label: 'KPIs', props: {} },
        { id: generateId('c'), type: 'LineChart', label: 'Trend Chart', props: {} },
        { id: generateId('c'), type: 'BarChart', label: 'Comparison Chart', props: {} },
        { id: generateId('c'), type: 'PieChart', label: 'Distribution', props: {} },
      ], apiCalls: ['getAnalytics', 'getReports']
    }],

    // Profile (common)
    profiles: [{
      id: generateId('screen'), name: 'ProfileScreen', type: 'profile', title: 'Profile',
      route: '/profile', description: 'User profile and account settings',
      userRoles: users, guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'Avatar', label: 'Profile Photo', props: { size: 80 } },
        { id: generateId('c'), type: 'Heading', label: 'User Name', props: {} },
        { id: generateId('c'), type: 'ListTile', label: 'Profile Settings', props: {} },
        { id: generateId('c'), type: 'Button', label: 'Edit Profile', props: { variant: 'outlined' } },
        { id: generateId('c'), type: 'Button', label: 'Logout', props: { variant: 'ghost' }, eventHandlers: { onPress: 'auth:logout' } },
      ], apiCalls: ['getProfile', 'updateProfile']
    }],

    // Notifications
    notifications: [{
      id: generateId('screen'), name: 'NotificationsScreen', type: 'notification', title: 'Notifications',
      route: '/notifications', description: 'App notifications and alerts',
      userRoles: users, guards: ['isAuthenticated'], components: [
        { id: generateId('c'), type: 'TopBar', label: 'Notifications Header', props: { title: 'Notifications' } },
        { id: generateId('c'), type: 'NotificationCard', label: 'Notification Items', props: {} },
      ], apiCalls: ['getNotifications', 'markNotificationRead']
    }],
  };

  // Add feature screens
  features.forEach(feature => {
    const featureScreens = featureScreenMap[feature];
    if (featureScreens) {
      featureScreens.forEach(s => {
        if (!screens.some(existing => existing.name === s.name)) {
          screens.push(s);
        }
      });
    } else {
      // Generate a dynamic screen for custom/unmapped features!
      const normalizedName = feature.replace(/[^a-zA-Z0-9]/g, '');
      const screenName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1) + 'Screen';
      const screenTitle = feature.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      if (!screens.some(existing => existing.name === screenName)) {
        screens.push({
          id: generateId('screen'),
          name: screenName,
          type: 'list',
          title: screenTitle,
          route: `/${feature.toLowerCase().replace(/_/g, '-')}`,
          description: `Custom screen for ${screenTitle} feature`,
          userRoles: users,
          guards: authRequired ? ['isAuthenticated'] : [],
          components: [
            { id: generateId('c'), type: 'TopBar', label: `${screenTitle} Header`, props: { title: screenTitle, showBack: true } },
            { id: generateId('c'), type: 'Container', label: 'Content Scroll', props: {}, children: [
              { id: generateId('c'), type: 'Card', label: 'Feature Info Card', props: {}, children: [
                { id: generateId('c'), type: 'Heading', label: screenTitle, props: { level: 'h2' } },
                { id: generateId('c'), type: 'Text', label: `Manage your ${screenTitle} module, views, and workflows here.`, props: {} }
              ] },
              { id: generateId('c'), type: 'List', label: 'Feature Items List', props: { itemsCount: 3, showChevron: true } }
            ] }
          ],
          apiCalls: [`get${normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1)}`]
        });
      }
    }
  });

  // Always add profile and settings if auth is required
  if (authRequired && !screens.some(s => s.type === 'profile')) {
    const profileScreens = featureScreenMap['profiles'];
    if (profileScreens) screens.push(...profileScreens);
  }

  return screens;
}
