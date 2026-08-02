import type { AppBlueprint, NavigationPlan, NavigationGroup, ScreenBlueprint } from '../blueprint/schema';

/**
 * NavigationCompiler — Auto-detection + generation of React Navigation files.
 *
 * Detects the correct navigation pattern from the Blueprint:
 * - screens > 5 with multiple roles → Bottom Tab + Stack per role
 * - Admin-only sections → Drawer Navigator
 * - Auth screens → Auth Stack
 * - ≤ 4 screens → Simple Bottom Tab
 */
export class NavigationCompiler {

  static compile(blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};
    const { screens, navigation, users } = blueprint;

    const pattern = NavigationCompiler.detectPattern(screens, users, navigation);

    // Types
    files['src/navigation/types.ts'] = NavigationCompiler.generateTypes(screens);

    // Auth Navigator (always)
    const authScreens = screens.filter(s => s.type === 'auth' || s.type === 'splash' || s.type === 'onboarding');
    if (authScreens.length > 0) {
      files['src/navigation/AuthNavigator.tsx'] = NavigationCompiler.generateAuthNavigator(authScreens);
    }

    // Main Navigator
    const mainScreens = screens.filter(s => s.type !== 'auth' && s.type !== 'splash' && s.type !== 'onboarding');

    if (pattern === 'drawer') {
      files['src/navigation/DrawerNavigator.tsx'] = NavigationCompiler.generateDrawerNavigator(mainScreens, users);
    } else {
      files['src/navigation/BottomTabNavigator.tsx'] = NavigationCompiler.generateBottomTabNavigator(mainScreens, users);
    }

    // Role-based navigators for each role
    users.forEach(role => {
      const roleScreens = mainScreens.filter(s => s.userRoles.includes(role));
      if (roleScreens.length > 0) {
        files[`src/navigation/${role}Navigator.tsx`] = NavigationCompiler.generateRoleStack(role, roleScreens);
      }
    });

    // Root Navigator
    files['src/navigation/AppNavigator.tsx'] = NavigationCompiler.generateRootNavigator(pattern, users, !!authScreens.length);

    return files;
  }

  // ── Pattern Detection ─────────────────────────────────────────────────────

  static detectPattern(screens: ScreenBlueprint[], roles: string[], nav: NavigationPlan): 'bottom-tabs' | 'drawer' | 'stack-only' {
    // If the blueprint explicitly specifies
    if (nav.type === 'drawer') return 'drawer';
    if (nav.type === 'stack-only') return 'stack-only';

    // Admin-heavy apps → Drawer
    const hasAdmin = roles.some(r => r.toLowerCase().includes('admin') || r.toLowerCase().includes('manager'));
    if (hasAdmin && screens.length > 6) return 'drawer';

    // Default: bottom tabs
    return 'bottom-tabs';
  }

  // ── Types Generator ───────────────────────────────────────────────────────

  private static generateTypes(screens: ScreenBlueprint[]): string {
    const stackParams = screens
      .map(s => {
        const params = s.params?.length
          ? s.params.map(p => `${p.name}: ${p.type}`).join('; ')
          : 'undefined';
        return `  ${s.name}: { ${params} };`;
      })
      .join('\n');

    return `// Auto-generated navigation types — do not edit manually

export type RootStackParamList = {
${stackParams}
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
`;
  }

  // ── Auth Navigator ────────────────────────────────────────────────────────

  private static generateAuthNavigator(authScreens: ScreenBlueprint[]): string {
    const imports = authScreens
      .map(s => `import ${s.name} from '../screens/${s.name}';`)
      .join('\n');

    const screens = authScreens
      .map(s => `        <Stack.Screen name="${s.name}" component={${s.name}} options={{ headerShown: false }} />`)
      .join('\n');

    return `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${imports}

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="${authScreens[0].name}">
${screens}
  </Stack.Navigator>
);
`;
  }

  // ── Bottom Tab Navigator ──────────────────────────────────────────────────

  private static generateBottomTabNavigator(screens: ScreenBlueprint[], roles: string[]): string {
    // Pick up to 5 main screens for bottom tabs
    const tabScreens = screens.filter(s =>
      ['home', 'dashboard', 'list', 'search', 'profile', 'settings'].includes(s.type)
    ).slice(0, 5);

    if (tabScreens.length === 0) return NavigationCompiler.generateFallbackNavigator(screens);

    const imports = tabScreens
      .map(s => `import ${s.name} from '../screens/${s.name}';`)
      .join('\n');

    const tabs = tabScreens.map(s => `
      <Tab.Screen
        name="${s.name}"
        component={${s.name}}
        options={{
          title: '${s.title}',
          tabBarLabel: '${s.title}',
        }}
      />`).join('');

    return `import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
${imports}

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingBottom: 4,
        height: 60,
      },
      tabBarActiveTintColor: '#3b82f6',
      tabBarInactiveTintColor: '#94a3b8',
      headerShown: false,
    }}
  >
${tabs}
  </Tab.Navigator>
);
`;
  }

  // ── Drawer Navigator ──────────────────────────────────────────────────────

  private static generateDrawerNavigator(screens: ScreenBlueprint[], roles: string[]): string {
    const drawerScreens = screens.slice(0, 8);

    const imports = drawerScreens
      .map(s => `import ${s.name} from '../screens/${s.name}';`)
      .join('\n');

    const drawerItems = drawerScreens.map(s => `
      <Drawer.Screen
        name="${s.name}"
        component={${s.name}}
        options={{ drawerLabel: '${s.title}', title: '${s.title}' }}
      />`).join('');

    return `import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
${imports}

const Drawer = createDrawerNavigator();

export const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      drawerStyle: { backgroundColor: '#ffffff', width: 280 },
      drawerActiveTintColor: '#3b82f6',
      drawerInactiveTintColor: '#64748b',
      headerStyle: { backgroundColor: '#ffffff' },
      headerTitleStyle: { fontWeight: '700' },
    }}
  >
${drawerItems}
  </Drawer.Navigator>
);
`;
  }

  // ── Role Stack ────────────────────────────────────────────────────────────

  private static generateRoleStack(role: string, screens: ScreenBlueprint[]): string {
    const imports = screens
      .map(s => `import ${s.name} from '../screens/${s.name}';`)
      .join('\n');

    const stackScreens = screens
      .map(s => `    <Stack.Screen name="${s.name}" component={${s.name}} options={{ title: '${s.title}' }} />`)
      .join('\n');

    return `import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${imports}

const Stack = createNativeStackNavigator();

// Stack Navigator for ${role} role
export const ${role}Navigator = () => (
  <Stack.Navigator>
${stackScreens}
  </Stack.Navigator>
);
`;
  }

  // ── Root Navigator ────────────────────────────────────────────────────────

  private static generateRootNavigator(pattern: string, roles: string[], hasAuth: boolean): string {
    const mainNav = pattern === 'drawer' ? 'DrawerNavigator' : 'BottomTabNavigator';

    return `import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${hasAuth ? `import { AuthNavigator } from './AuthNavigator';` : ''}
import { ${mainNav} } from './${mainNav}';

const RootStack = createNativeStackNavigator();

export const AppNavigator = () => {
  // TODO: Replace with actual auth state from store
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={${mainNav}} />
        ) : (
          ${hasAuth ? `<RootStack.Screen name="Auth" component={AuthNavigator} />` : `<RootStack.Screen name="Main" component={${mainNav}} />`}
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
`;
  }

  private static generateFallbackNavigator(screens: ScreenBlueprint[]): string {
    const imports = screens.slice(0, 5).map(s => `import ${s.name} from '../screens/${s.name}';`).join('\n');
    const tabs = screens.slice(0, 5).map(s => `      <Tab.Screen name="${s.name}" component={${s.name}} options={{ title: '${s.title}' }} />`).join('\n');

    return `import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
${imports}

const Tab = createBottomTabNavigator();

export const BottomTabNavigator = () => (
  <Tab.Navigator>
${tabs}
  </Tab.Navigator>
);
`;
  }
}
