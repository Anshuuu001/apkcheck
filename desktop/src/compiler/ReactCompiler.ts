import type { AppBlueprint, ScreenBlueprint, ComponentBlueprint, ThemeTokens } from '../blueprint/schema';
import { ComponentIndex } from '../registry/ComponentIndex';

/**
 * ReactCompiler — Deterministic Screen Compiler.
 *
 * Blueprint → Screen Compiler → Production .tsx files
 *
 * AI does NOT write JSX. This compiler reads the Blueprint
 * and generates consistent, typed, theme-aware React Native files.
 */
export class ReactCompiler {

  /**
   * Full project compilation: returns a file path → content map.
   */
  static compile(blueprint: AppBlueprint): Record<string, string> {
    const files: Record<string, string> = {};
    const { screens, theme, users, name: appName } = blueprint;

    // ── 1. Compile each screen ────────────────────────────────────────────────
    screens.forEach(screen => {
      const path = `src/screens/${screen.name}.tsx`;
      files[path] = ReactCompiler.compileScreen(screen, theme, appName);
    });

    // ── 2. Compile shared components from all registries ─────────────────────
    const usedComponents = ReactCompiler.collectUsedComponents(screens);
    usedComponents.forEach(componentName => {
      const resolved = ComponentIndex.resolve(componentName);
      if (resolved) {
        files[`src/components/${componentName}.tsx`] = resolved.template.trim();
      }
    });

    // ── 3. Always include core buttons and inputs ─────────────────────────────
    files['src/components/PrimaryButton.tsx'] = ComponentIndex.get('button', 'PrimaryButton').trim();
    files['src/components/SecondaryButton.tsx'] = ComponentIndex.get('button', 'SecondaryButton').trim();
    files['src/components/EmailField.tsx'] = ComponentIndex.get('input', 'EmailField').trim();
    files['src/components/PasswordField.tsx'] = ComponentIndex.get('input', 'PasswordField').trim();
    files['src/components/TextField.tsx'] = ComponentIndex.get('input', 'TextField').trim();
    files['src/components/SearchBar.tsx'] = ComponentIndex.get('input', 'SearchBar').trim();

    // ── 4. Theme tokens file ──────────────────────────────────────────────────
    files['src/theme/colors.ts'] = ReactCompiler.generateThemeFile(theme);

    // ── 5. Type definitions ───────────────────────────────────────────────────
    files['src/types/index.ts'] = ReactCompiler.generateTypes(users);

    // ── 6. App entry ──────────────────────────────────────────────────────────
    files['App.tsx'] = ReactCompiler.generateAppEntry(screens);

    return files;
  }

  // ── Screen Compiler ─────────────────────────────────────────────────────────

  static compileScreen(screen: ScreenBlueprint, theme: ThemeTokens, appName: string): string {
    const imports = ReactCompiler.buildImports(screen);
    const stateVars = ReactCompiler.buildStateVars(screen);
    const apiCalls = ReactCompiler.buildApiCalls(screen);
    const body = ReactCompiler.buildScreenBody(screen, theme);
    const styles = ReactCompiler.buildStyles(screen, theme);

    return `import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  ActivityIndicator, RefreshControl, TouchableOpacity
} from 'react-native';
${imports}

${ReactCompiler.buildNavigationProps(screen)}

const ${screen.name}: React.FC<${screen.name}Props> = ({ navigation, route }) => {
${stateVars}
${apiCalls}

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="${theme.colors.primary}" />
        }
      >
${body}
      </ScrollView>
    </SafeAreaView>
  );
};

${styles}

export default ${screen.name};
`;
  }

  // ── Import Builder ────────────────────────────────────────────────────────

  private static buildImports(screen: ScreenBlueprint): string {
    const imports: string[] = [];
    const compTypes = screen.components.map(c => c.type);

    if (compTypes.some(t => ['LoginForm', 'RegisterForm'].includes(t as string))) {
      imports.push(`import { ${screen.components.filter(c => ['LoginForm','RegisterForm'].includes(c.type as string)).map(c => c.type).join(', ')} } from '../components';`);
    }
    if (compTypes.some(t => ['StatsCard', 'SimpleCard', 'ProfileCard', 'AppointmentCard', 'ProductCard', 'OrderCard'].includes(t as string))) {
      const cards = screen.components.filter(c => ['StatsCard','SimpleCard','ProfileCard','AppointmentCard','ProductCard','OrderCard'].includes(c.type as string)).map(c => c.type);
      imports.push(`import { ${[...new Set(cards)].join(', ')} } from '../components';`);
    }
    if (compTypes.includes('SearchBar')) {
      imports.push(`import { SearchBar } from '../components/SearchBar';`);
    }
    return imports.join('\n');
  }

  // ── Navigation Props Builder ──────────────────────────────────────────────

  private static buildNavigationProps(screen: ScreenBlueprint): string {
    const params = screen.params?.map(p => `  ${p.name}: ${p.type};`).join('\n') ?? '';
    return `type ${screen.name}Props = {
  navigation: any;
  route: any;
};`;
  }

  // ── State Variables Builder ───────────────────────────────────────────────

  private static buildStateVars(screen: ScreenBlueprint): string {
    const lines: string[] = [];
    lines.push('  const [loading, setLoading] = useState(false);');
    lines.push('  const [refreshing, setRefreshing] = useState(false);');
    lines.push('  const [error, setError] = useState<string | null>(null);');

    screen.stateVariables?.forEach(sv => {
      const val = typeof sv.initialValue === 'string'
        ? `'${sv.initialValue}'`
        : JSON.stringify(sv.initialValue);
      lines.push(`  const [${sv.name}, set${ReactCompiler.capitalize(sv.name)}] = useState<${sv.type}>(${val});`);
    });

    lines.push('');
    lines.push(`  const onRefresh = useCallback(async () => {`);
    lines.push(`    setRefreshing(true);`);
    lines.push(`    // TODO: refetch data`);
    lines.push(`    setRefreshing(false);`);
    lines.push(`  }, []);`);

    return lines.join('\n');
  }

  // ── API Calls Builder ─────────────────────────────────────────────────────

  private static buildApiCalls(screen: ScreenBlueprint): string {
    if (!screen.apiCalls || screen.apiCalls.length === 0) return '';
    return `
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // TODO: Implement API calls: ${screen.apiCalls.join(', ')}
      } catch (err) {
        setError('Failed to load data. Pull down to retry.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);`;
  }

  // ── Screen Body Builder ───────────────────────────────────────────────────

  private static buildScreenBody(screen: ScreenBlueprint, theme: ThemeTokens): string {
    if (screen.components.length === 0) {
      return `        <View style={styles.empty}>
          <Text style={styles.emptyText}>${screen.title} Screen</Text>
        </View>`;
    }

    const lines: string[] = [];

    // Screen header
    lines.push(`        {/* ── Header ─────────────────────────────── */}`);
    lines.push(`        <View style={styles.header}>`);
    lines.push(`          <Text style={styles.headerTitle}>${screen.title}</Text>`);
    lines.push(`        </View>`);

    if (screen.type === 'dashboard') {
      lines.push(`        {/* ── Stats Row ──────────────────────────── */}`);
      lines.push(`        <View style={styles.statsRow}>`);
      lines.push(`          {loading ? (`);
      lines.push(`            <ActivityIndicator color="${theme.colors.primary}" />`);
      lines.push(`          ) : (`);
      lines.push(`            <Text style={styles.loadedText}>Dashboard loaded</Text>`);
      lines.push(`          )}`);
      lines.push(`        </View>`);
    }

    screen.components.forEach(comp => {
      lines.push(...ReactCompiler.buildComponent(comp, theme));
    });

    return lines.join('\n');
  }

  // ── Component Builder ─────────────────────────────────────────────────────

  private static buildComponent(comp: ComponentBlueprint, theme: ThemeTokens): string[] {
    const lines: string[] = [];
    const onPress = comp.eventHandlers?.onPress
      ? `() => navigation.navigate('${comp.eventHandlers.onPress.replace('navigateTo:', '')}')`
      : '() => {}';

    switch (comp.type) {
      case 'Button':
        lines.push(`        <PrimaryButton title="${comp.label ?? 'Button'}" onPress={${onPress}} style={styles.button} />`);
        break;
      case 'LoginForm':
        lines.push(`        <LoginForm`);
        lines.push(`          onSubmit={async (email, password) => {`);
        lines.push(`            // TODO: call auth API`);
        lines.push(`            navigation.navigate('Home');`);
        lines.push(`          }}`);
        lines.push(`          onRegister={() => navigation.navigate('Register')}`);
        lines.push(`          onForgotPassword={() => navigation.navigate('ForgotPassword')}`);
        lines.push(`        />`);
        break;
      case 'SearchBar':
        lines.push(`        <SearchBar`);
        lines.push(`          value={searchQuery ?? ''}`);
        lines.push(`          onChangeText={text => setSearchQuery(text)}`);
        lines.push(`          placeholder="Search..."`);
        lines.push(`        />`);
        break;
      case 'Text':
      case 'Heading':
        lines.push(`        <Text style={styles.bodyText}>${comp.props.text ?? comp.label ?? 'Content'}</Text>`);
        break;
      default:
        lines.push(`        {/* ${comp.type}: ${comp.label ?? comp.id} */}`);
        lines.push(`        <View style={styles.componentPlaceholder}>`);
        lines.push(`          <Text style={styles.placeholderText}>${comp.label ?? comp.type}</Text>`);
        lines.push(`        </View>`);
    }

    return lines;
  }

  // ── Styles Builder ────────────────────────────────────────────────────────

  private static buildStyles(screen: ScreenBlueprint, theme: ThemeTokens): string {
    return `const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '${theme.colors.background}' },
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: '${theme.colors.surface}',
    borderBottomWidth: 1,
    borderBottomColor: '${theme.colors.divider}',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '${theme.colors.onSurface}',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 20,
  },
  button: { margin: 16 },
  bodyText: {
    fontSize: 15,
    color: '${theme.colors.onSurface}',
    paddingHorizontal: 20,
    paddingVertical: 8,
    lineHeight: 22,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '${theme.colors.onSurface}' },
  loadedText: { fontSize: 14, color: '${theme.colors.onBackground}' },
  componentPlaceholder: {
    margin: 16,
    padding: 16,
    backgroundColor: '${theme.colors.surfaceVariant}',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '${theme.colors.divider}',
  },
  placeholderText: { fontSize: 14, color: '${theme.colors.onBackground}', textAlign: 'center' },
});`;
  }

  // ── Theme File Generator ──────────────────────────────────────────────────

  static generateThemeFile(theme: ThemeTokens): string {
    return `// Auto-generated theme tokens — do not edit manually
// Source: AppBlueprint.theme

export const Colors = ${JSON.stringify(theme.colors, null, 2)};

export const Spacing = ${JSON.stringify(theme.spacing, null, 2)};

export const BorderRadius = ${JSON.stringify(theme.borderRadius, null, 2)};

export const Typography = ${JSON.stringify(theme.typography, null, 2)};

export const Theme = {
  mode: '${theme.mode}' as const,
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  iconSet: '${theme.iconSet}' as const,
};

export default Theme;
`;
  }

  // ── Types File Generator ──────────────────────────────────────────────────

  static generateTypes(roles: string[]): string {
    const roleUnion = roles.map(r => `'${r}'`).join(' | ');
    return `// Auto-generated types — do not edit manually

export type UserRole = ${roleUnion};

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  refreshToken?: string;
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
`;
  }

  // ── App Entry Generator ───────────────────────────────────────────────────

  static generateAppEntry(screens: ScreenBlueprint[]): string {
    const imports = screens
      .map(s => `import ${s.name} from './src/screens/${s.name}';`)
      .join('\n');

    return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
${imports}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="${screens.find(s => s.type === 'auth' || s.type === 'splash')?.name ?? screens[0]?.name ?? 'Home'}">
        ${screens.map(s => `<Stack.Screen name="${s.name}" component={${s.name}} options={{ title: '${s.title}' }} />`).join('\n        ')}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`;
  }

  // ── Utilities ─────────────────────────────────────────────────────────────

  private static collectUsedComponents(screens: ScreenBlueprint[]): Set<string> {
    const names = new Set<string>();
    const visit = (comp: ComponentBlueprint) => {
      names.add(comp.type as string);
      comp.children?.forEach(visit);
    };
    screens.forEach(s => s.components.forEach(visit));
    return names;
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
