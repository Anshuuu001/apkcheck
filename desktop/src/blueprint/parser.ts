/**
 * AppForge-AI — Blueprint Parser & Validator
 * 
 * Parses raw JSON strings into typed AppBlueprint objects.
 * Validates structure and fills missing fields with safe defaults.
 */

import type {
  AppBlueprint, ThemeTokens, NavigationPlan, DatabasePlan,
  ApiPlan, ScreenBlueprint,
  ColorPalette, Typography, Spacing, BorderRadius, Elevation,
  BuildPipeline
} from './schema';

import colorsTokens from '../design-system/colors.json';
import typographyTokens from '../design-system/typography.json';
import spacingTokens from '../design-system/spacing.json';
import radiusTokens from '../design-system/radius.json';
import elevationTokens from '../design-system/elevation.json';

// ─── Default Theme (sourced from central design system) ───────────────────────

export const DEFAULT_COLORS: ColorPalette = colorsTokens.themes.dark;

export const DEFAULT_TYPOGRAPHY: Typography = {
  fontFamily: 'Inter',
  fontFamilyMono: 'JetBrains Mono',
  scale: typographyTokens.scale as any,
};

export const DEFAULT_SPACING: Spacing = spacingTokens;

export const DEFAULT_RADIUS: BorderRadius = radiusTokens;

export const DEFAULT_ELEVATION: Elevation = elevationTokens;

export const DEFAULT_THEME: ThemeTokens = {
  mode: 'dark',
  colors: DEFAULT_COLORS,
  typography: DEFAULT_TYPOGRAPHY,
  spacing: DEFAULT_SPACING,
  borderRadius: DEFAULT_RADIUS,
  elevation: DEFAULT_ELEVATION,
  iconSet: 'lucide',
};

export const DEFAULT_NAVIGATION: NavigationPlan = {
  type: 'bottom-tabs',
  groups: [],
};

export const DEFAULT_DATABASE: DatabasePlan = {
  dbType: 'mysql',
  tables: [],
  relationships: [],
};

export const DEFAULT_API: ApiPlan = {
  baseUrl: '/api/v1',
  version: 'v1',
  authScheme: 'jwt',
  endpoints: [],
};

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Parse a raw blueprint JSON string into a typed AppBlueprint.
 * Fills all missing fields with safe defaults.
 * Never throws — always returns a valid object.
 */
export function parseBlueprint(raw: string | object | null | undefined): AppBlueprint {
  let parsed: any = {};

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      console.warn('[BlueprintParser] Failed to parse blueprint JSON, using defaults');
      parsed = {};
    }
  } else if (typeof raw === 'object' && raw !== null) {
    parsed = raw;
  }

  const now = new Date().toISOString();

  return {
    id: parsed.id || generateBlueprintId(),
    version: parsed.version || '1.0.0',
    schemaVersion: parsed.schemaVersion || '1',
    createdAt: parsed.createdAt || now,
    updatedAt: now,

    name: parsed.name || 'Untitled App',
    packageName: parsed.packageName || 'com.appforge.app',
    description: parsed.description || '',
    industry: parsed.industry || 'Custom',
    appType: parsed.appType || 'Mobile App',
    icon: parsed.icon,

    users: Array.isArray(parsed.users) ? parsed.users : ['User'],
    authRequired: parsed.authRequired !== undefined ? parsed.authRequired : true,

    theme: mergeTheme(parsed.theme),

    screens: Array.isArray(parsed.screens) ? parsed.screens.map(parseScreen) : [],
    navigation: parseNavigation(parsed.navigation),
    database: parseDatabase(parsed.database),
    api: parseApi(parsed.api),
    businessLogic: Array.isArray(parsed.businessLogic) ? parsed.businessLogic : [],
    permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],

    intentResult: parsed.intentResult,
    requirementAnswers: parsed.requirementAnswers,

    notifications: parsed.notifications || { enabled: true, channels: [], provider: 'none', templates: [] },
    validations: Array.isArray(parsed.validations) ? parsed.validations : [],
    assets: Array.isArray(parsed.assets) ? parsed.assets : [],
    settings: parsed.settings || {
      defaultLanguage: 'en',
      supportedLanguages: ['en'],
      darkModeSupport: true,
      defaultThemeMode: 'system',
      cacheTtlSeconds: 300,
      sessionTimeoutMinutes: 30,
      allowGuestMode: false,
      analyticsEnabled: true,
      crashReportingEnabled: true,
      forceUpdateEnabled: false,
    },
    buildPipeline: parseBuildPipeline(parsed.buildPipeline || parsed.buildConfig),
    metadata: parsed.metadata || {
      generatedAt: now,
      buildCount: 0,
      aiConfidence: 0,
      tags: [],
    },
  };
}

function parseBuildPipeline(raw: any): BuildPipeline {
  if (!raw) {
    return {
      outputDir: 'output/app',
      stages: [],
      gradleConfig: {
        minSdkVersion: 24,
        targetSdkVersion: 34,
        compileSdkVersion: 34,
        versionCode: 1,
        versionName: '1.0.0',
      }
    };
  }
  
  const gradleConfig = raw.gradleConfig || {
    minSdkVersion: raw.minSdkVersion !== undefined ? raw.minSdkVersion : 24,
    targetSdkVersion: raw.targetSdkVersion !== undefined ? raw.targetSdkVersion : 34,
    compileSdkVersion: raw.compileSdkVersion !== undefined ? raw.compileSdkVersion : 34,
    versionCode: raw.versionCode !== undefined ? raw.versionCode : 1,
    versionName: raw.versionName || '1.0.0',
  };

  return {
    outputDir: raw.outputDir || 'output/app',
    stages: Array.isArray(raw.stages) ? raw.stages : [],
    signingConfig: raw.signingConfig,
    gradleConfig,
  };
}

function mergeTheme(raw: any): ThemeTokens {
  if (!raw) return DEFAULT_THEME;
  return {
    mode: raw.mode || DEFAULT_THEME.mode,
    colors: { ...DEFAULT_COLORS, ...(raw.colors || {}) },
    typography: raw.typography ? {
      fontFamily: raw.typography.fontFamily || DEFAULT_TYPOGRAPHY.fontFamily,
      fontFamilyMono: raw.typography.fontFamilyMono || DEFAULT_TYPOGRAPHY.fontFamilyMono,
      scale: { ...DEFAULT_TYPOGRAPHY.scale, ...(raw.typography.scale || {}) },
    } : DEFAULT_TYPOGRAPHY,
    spacing: { ...DEFAULT_SPACING, ...(raw.spacing || {}) },
    borderRadius: { ...DEFAULT_RADIUS, ...(raw.borderRadius || {}) },
    elevation: { ...DEFAULT_ELEVATION, ...(raw.elevation || {}) },
    iconSet: raw.iconSet || DEFAULT_THEME.iconSet,
  };
}

function parseScreen(raw: any): ScreenBlueprint {
  return {
    id: raw.id || generateId('screen'),
    name: raw.name || 'UnnamedScreen',
    route: raw.route || `/${(raw.name || 'screen').toLowerCase().replace(/\s/g, '-')}`,
    type: raw.type || 'custom',
    layout: raw.layout || 'BaseLayout',
    title: raw.title || raw.name || 'Screen',
    description: raw.description || '',
    userRoles: Array.isArray(raw.userRoles) ? raw.userRoles : ['User'],
    components: Array.isArray(raw.components) ? raw.components : [],
    stateVariables: raw.stateVariables || [],
    apiCalls: raw.apiCalls || [],
    guards: raw.guards || [],
    params: raw.params || [],
  };
}

function parseNavigation(raw: any): NavigationPlan {
  if (!raw) return DEFAULT_NAVIGATION;
  return {
    type: raw.type || 'bottom-tabs',
    groups: Array.isArray(raw.groups) ? raw.groups : [],
    deepLinks: raw.deepLinks,
    authFlow: raw.authFlow,
  };
}

function parseDatabase(raw: any): DatabasePlan {
  if (!raw) return DEFAULT_DATABASE;
  return {
    dbType: raw.dbType || 'mysql',
    tables: Array.isArray(raw.tables) ? raw.tables : [],
    relationships: Array.isArray(raw.relationships) ? raw.relationships : [],
    seedData: raw.seedData,
  };
}

function parseApi(raw: any): ApiPlan {
  if (!raw) return DEFAULT_API;
  return {
    baseUrl: raw.baseUrl || '/api/v1',
    version: raw.version || 'v1',
    authScheme: raw.authScheme || 'jwt',
    endpoints: Array.isArray(raw.endpoints) ? raw.endpoints : [],
  };
}

// ─── Serializer ───────────────────────────────────────────────────────────────

/**
 * Serialize a blueprint to a compact JSON string for storage.
 */
export function serializeBlueprint(blueprint: AppBlueprint): string {
  const updated = { ...blueprint, updatedAt: new Date().toISOString() };
  return JSON.stringify(updated, null, 2);
}

// ─── Compatibility: Legacy Blueprint Format ───────────────────────────────────

/**
 * Migrate old-format blueprints (from pre-architecture-upgrade projects)
 * to the new AppBlueprint schema.
 */
export function migrateLegacyBlueprint(legacy: any, projectName: string): AppBlueprint {
  const base = parseBlueprint(null);
  
  return {
    ...base,
    name: projectName || legacy.name || 'Migrated App',
    screens: Array.isArray(legacy.screens) 
      ? legacy.screens.map((s: any) => parseScreen({
          id: s.id || generateId('screen'),
          name: s.name,
          type: 'custom',
          title: s.name,
          description: '',
          userRoles: ['User'],
          components: [],
        }))
      : [],
    database: {
      dbType: 'mysql',
      tables: Array.isArray(legacy.database?.tables) ? legacy.database.tables : [],
      relationships: [],
    },
    api: {
      baseUrl: '/api/v1',
      version: 'v1',
      authScheme: 'jwt',
      endpoints: Array.isArray(legacy.api?.endpoints) ? legacy.api.endpoints : [],
    },
    navigation: legacy.navigation?.routes
      ? {
          type: 'stack-only',
          groups: [{
            id: 'main',
            type: 'stack',
            userRoles: ['User'],
            routes: legacy.navigation.routes.map((r: any) => ({
              name: r.name || 'Screen',
              screenId: r.name || 'Screen',
            })),
          }],
        }
      : DEFAULT_NAVIGATION,
  };
}

// ─── Diff Blueprint ──────────────────────────────────────────────────────────

/**
 * Get a human-readable summary of what changed between two blueprints.
 */
export function diffBlueprints(before: AppBlueprint, after: AppBlueprint): string[] {
  const changes: string[] = [];

  if (before.screens.length !== after.screens.length) {
    const diff = after.screens.length - before.screens.length;
    changes.push(`${diff > 0 ? 'Added' : 'Removed'} ${Math.abs(diff)} screen(s)`);
  }

  if (before.database.tables.length !== after.database.tables.length) {
    const diff = after.database.tables.length - before.database.tables.length;
    changes.push(`${diff > 0 ? 'Added' : 'Removed'} ${Math.abs(diff)} database table(s)`);
  }

  if (before.api.endpoints.length !== after.api.endpoints.length) {
    const diff = after.api.endpoints.length - before.api.endpoints.length;
    changes.push(`${diff > 0 ? 'Added' : 'Removed'} ${Math.abs(diff)} API endpoint(s)`);
  }

  if (before.theme.mode !== after.theme.mode) {
    changes.push(`Changed theme mode: ${before.theme.mode} → ${after.theme.mode}`);
  }

  if (before.navigation.type !== after.navigation.type) {
    changes.push(`Changed navigation: ${before.navigation.type} → ${after.navigation.type}`);
  }

  if (before.name !== after.name) {
    changes.push(`Renamed app: "${before.name}" → "${after.name}"`);
  }

  return changes;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

let _idCounter = 0;

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++_idCounter}`;
}

export function generateBlueprintId(): string {
  return `bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Validate that a blueprint has the minimum required fields to be usable.
 */
export function validateBlueprint(blueprint: AppBlueprint): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!blueprint.name || blueprint.name.trim().length === 0) {
    errors.push('Blueprint must have a name');
  }
  if (!blueprint.industry) {
    errors.push('Blueprint must have an industry classification');
  }
  if (!blueprint.screens || blueprint.screens.length === 0) {
    errors.push('Blueprint must have at least one screen');
  }
  if (!blueprint.theme) {
    errors.push('Blueprint must have a theme');
  }
  if (!blueprint.database) {
    errors.push('Blueprint must have a database plan');
  }
  if (!blueprint.api) {
    errors.push('Blueprint must have an API plan');
  }

  blueprint.screens.forEach((screen, i) => {
    if (!screen.name) errors.push(`Screen at index ${i} is missing a name`);
    if (!screen.route) errors.push(`Screen "${screen.name}" is missing a route`);
  });

  return { valid: errors.length === 0, errors };
}
