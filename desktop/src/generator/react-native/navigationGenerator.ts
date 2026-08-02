import type { ScreenBlueprint, NavigationPlan } from '../../blueprint/schema';

export function generateNavigationRN(screens: ScreenBlueprint[], navigation: NavigationPlan): string {
  const isBottomTabs = navigation.type === 'bottom-tabs';

  const routeScreens = screens.map(s => {
    return `import ${s.name} from '../screens/${s.name}';`;
  }).join('\n');

  const stackScreens = screens.map(s => {
    return `<Stack.Screen name="${s.name}" component={${s.name}} options={{ title: "${s.title}" }} />`;
  }).join('\n        ');

  const bottomTabScreens = screens.slice(0, 5).map(s => {
    return `<Tab.Screen name="${s.name}" component={${s.name}} options={{ title: "${s.title}" }} />`;
  }).join('\n        ');

  if (isBottomTabs) {
    return `
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { theme } from '../theme/theme';

${routeScreens}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: { backgroundColor: theme.colors.surface },
      }}
    >
      ${bottomTabScreens}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
        }}
      >
        <Stack.Screen name="MainTabs" component={HomeTabs} options={{ headerShown: false }} />
        ${stackScreens}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`.trim();
  }

  // Draw navigator fallback
  return `
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { theme } from '../theme/theme';

${routeScreens}

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTintColor: theme.colors.onSurface,
        }}
      >
        ${stackScreens}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`.trim();
}
