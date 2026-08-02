import type { ScreenBlueprint } from '../../blueprint/schema';
import { generateComponentCode } from './componentGenerator';

export function generateScreenRN(screen: ScreenBlueprint): string {
  const componentImports = new Set<string>();
  componentImports.add('View');
  componentImports.add('Text');
  componentImports.add('ScrollView');
  componentImports.add('StyleSheet');
  componentImports.add('TouchableOpacity');

  // Parse components code
  const componentsJSX = screen.components.map(c => {
    // Basic import detection based on components
    if (c.type === 'List') componentImports.add('FlatList');
    if (c.type === 'Chat') {
      componentImports.add('TextInput');
      componentImports.add('ScrollView');
    }
    return generateComponentCode(c);
  }).join('\n\n  ');

  const importsList = Array.from(componentImports).join(', ');

  return `
import React from 'react';
import { ${importsList} } from 'react-native';
import { theme } from '../theme/theme';

export default function ${screen.name}({ navigation }: any) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        ${componentsJSX || '<Text>Empty Screen</Text>'}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
});
`.trim();
}
