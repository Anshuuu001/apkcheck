import type { NavigationPlan } from '../blueprint/schema';

export class NavigationCompiler {
  static compile(plan: NavigationPlan): string {
    const screens = plan.groups.flatMap(g => g.routes.map(r => r.screenId));
    const imports = screens.map(s => `import ${s} from '../screens/${s}';`).join('\n');
    const routeItems = screens.map(s => `      <Stack.Screen name="${s}" component={${s}} />`).join('\n');

    return `
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
${imports}

const Stack = createNativeStackNavigator();

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="${screens[0] || 'Home'}">
${routeItems}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`;
  }
}
