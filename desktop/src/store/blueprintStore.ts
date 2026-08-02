/**
 * AppForge-AI — Blueprint Zustand Store
 * 
 * The central state manager for the active project's AppBlueprint.
 * All engines write to this store. All renderers read from this store.
 * Nothing reads or writes the blueprint directly — always go through this store.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  AppBlueprint, ScreenBlueprint, DatabaseTable, ApiEndpoint,
  BusinessFlow, ThemeTokens, NavigationPlan, AppPermission,
  ComponentBlueprint
} from '../blueprint/schema';
import { 
  parseBlueprint, serializeBlueprint, validateBlueprint,
  generateId, migrateLegacyBlueprint 
} from '../blueprint/parser';

// ─── Store Interface ──────────────────────────────────────────────────────────

interface BlueprintStore {
  // State
  blueprint: AppBlueprint | null;
  isDirty: boolean;                  // Has unsaved changes
  isSaving: boolean;
  lastSavedAt: string | null;
  validationErrors: string[];

  // History (undo/redo)
  history: string[];                 // Serialized blueprint snapshots
  historyIndex: number;

  // Actions — Lifecycle
  initBlueprint: (raw: string | object | null, projectName?: string) => void;
  loadLegacyBlueprint: (legacy: any, projectName: string) => void;
  clearBlueprint: () => void;
  markSaved: () => void;

  // Actions — Top-level Blueprint
  updateBlueprintMeta: (meta: Partial<Pick<AppBlueprint, 'name' | 'packageName' | 'description' | 'industry' | 'appType' | 'users' | 'authRequired'>>) => void;
  setTheme: (theme: ThemeTokens) => void;
  updateThemeColor: (key: string, value: string) => void;
  setNavigation: (plan: NavigationPlan) => void;

  // Actions — Screens
  addScreen: (screen: Omit<ScreenBlueprint, 'id'>) => ScreenBlueprint;
  updateScreen: (screenId: string, updates: Partial<ScreenBlueprint>) => void;
  removeScreen: (screenId: string) => void;
  reorderScreens: (fromIndex: number, toIndex: number) => void;

  // Actions — Components (within a screen)
  addComponentToScreen: (screenId: string, component: Omit<ComponentBlueprint, 'id'>) => void;
  updateComponent: (screenId: string, componentId: string, updates: Partial<ComponentBlueprint>) => void;
  removeComponent: (screenId: string, componentId: string) => void;

  // Actions — Database
  addTable: (table: Omit<DatabaseTable, 'id'>) => void;
  updateTable: (tableId: string, updates: Partial<DatabaseTable>) => void;
  removeTable: (tableId: string) => void;

  // Actions — API
  addEndpoint: (endpoint: Omit<ApiEndpoint, 'id'>) => ApiEndpoint;
  updateEndpoint: (endpointId: string, updates: Partial<ApiEndpoint>) => void;
  removeEndpoint: (endpointId: string) => void;

  // Actions — Business Logic
  addBusinessFlow: (flow: Omit<BusinessFlow, 'id'>) => void;
  removeBusinessFlow: (flowId: string) => void;

  // Actions — Permissions
  setPermissions: (permissions: AppPermission[]) => void;

  // Actions — Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Actions — Full replace (used by AI engines)
  setFullBlueprint: (blueprint: AppBlueprint) => void;
  mergeBlueprint: (partial: Partial<AppBlueprint>) => void;

  // Selectors
  getScreen: (screenId: string) => ScreenBlueprint | undefined;
  getSerializedBlueprint: () => string;
  getValidationErrors: () => string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MAX_HISTORY = 50;

function withHistory(
  get: () => BlueprintStore,
  set: (fn: (state: BlueprintStore) => Partial<BlueprintStore>) => void,
  mutate: (bp: AppBlueprint) => AppBlueprint
): void {
  const current = get().blueprint;
  if (!current) return;

  const updated = mutate({ ...current, updatedAt: new Date().toISOString() });
  const snapshot = serializeBlueprint(updated);

  // Validation
  const { errors } = validateBlueprint(updated);

  set((state) => {
    const truncatedHistory = state.history.slice(0, state.historyIndex + 1);
    const newHistory = [...truncatedHistory, snapshot].slice(-MAX_HISTORY);

    return {
      blueprint: updated,
      isDirty: true,
      validationErrors: errors,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    };
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useBlueprintStore = create<BlueprintStore>()(
  subscribeWithSelector((set, get) => ({
    blueprint: null,
    isDirty: false,
    isSaving: false,
    lastSavedAt: null,
    validationErrors: [],
    history: [],
    historyIndex: -1,

    // ── Lifecycle ──────────────────────────────────────────────────────────────

    initBlueprint: (raw, projectName) => {
      const blueprint = parseBlueprint(raw);
      if (projectName && !blueprint.name) blueprint.name = projectName;
      const snapshot = serializeBlueprint(blueprint);
      const { errors } = validateBlueprint(blueprint);
      set({
        blueprint,
        isDirty: false,
        validationErrors: errors,
        history: [snapshot],
        historyIndex: 0,
      });
    },

    loadLegacyBlueprint: (legacy, projectName) => {
      const blueprint = migrateLegacyBlueprint(legacy, projectName);
      const snapshot = serializeBlueprint(blueprint);
      set({
        blueprint,
        isDirty: true, // needs saving after migration
        validationErrors: [],
        history: [snapshot],
        historyIndex: 0,
      });
    },

    clearBlueprint: () => set({
      blueprint: null, isDirty: false, isSaving: false,
      lastSavedAt: null, validationErrors: [], history: [], historyIndex: -1,
    }),

    markSaved: () => set({ isDirty: false, isSaving: false, lastSavedAt: new Date().toISOString() }),

    // ── Top-level Updates ──────────────────────────────────────────────────────

    updateBlueprintMeta: (meta) => {
      withHistory(get, set, (bp) => ({ ...bp, ...meta }));
    },

    setTheme: (theme) => {
      withHistory(get, set, (bp) => ({ ...bp, theme }));
    },

    updateThemeColor: (key, value) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        theme: { ...bp.theme, colors: { ...bp.theme.colors, [key]: value } }
      }));
    },

    setNavigation: (plan) => {
      withHistory(get, set, (bp) => ({ ...bp, navigation: plan }));
    },

    // ── Screens ────────────────────────────────────────────────────────────────

    addScreen: (screen) => {
      const id = generateId('screen');
      const newScreen: ScreenBlueprint = { ...screen, id } as ScreenBlueprint;
      withHistory(get, set, (bp) => ({ ...bp, screens: [...bp.screens, newScreen] }));
      return newScreen;
    },

    updateScreen: (screenId, updates) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        screens: bp.screens.map((s) => s.id === screenId ? { ...s, ...updates } : s),
      }));
    },

    removeScreen: (screenId) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        screens: bp.screens.filter((s) => s.id !== screenId),
      }));
    },

    reorderScreens: (fromIndex, toIndex) => {
      withHistory(get, set, (bp) => {
        const screens = [...bp.screens];
        const [moved] = screens.splice(fromIndex, 1);
        screens.splice(toIndex, 0, moved);
        return { ...bp, screens };
      });
    },

    // ── Components ─────────────────────────────────────────────────────────────

    addComponentToScreen: (screenId, component) => {
      const id = generateId('comp');
      const newComp: ComponentBlueprint = { ...component, id } as ComponentBlueprint;
      withHistory(get, set, (bp) => ({
        ...bp,
        screens: bp.screens.map((s) =>
          s.id === screenId
            ? { ...s, components: [...s.components, newComp] }
            : s
        ),
      }));
    },

    updateComponent: (screenId, componentId, updates) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        screens: bp.screens.map((s) =>
          s.id === screenId
            ? {
                ...s,
                components: s.components.map((c) =>
                  c.id === componentId ? { ...c, ...updates } : c
                ),
              }
            : s
        ),
      }));
    },

    removeComponent: (screenId, componentId) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        screens: bp.screens.map((s) =>
          s.id === screenId
            ? { ...s, components: s.components.filter((c) => c.id !== componentId) }
            : s
        ),
      }));
    },

    // ── Database ───────────────────────────────────────────────────────────────

    addTable: (table) => {
      const id = generateId('table');
      const newTable: DatabaseTable = { ...table, id };
      withHistory(get, set, (bp) => ({
        ...bp,
        database: { ...bp.database, tables: [...bp.database.tables, newTable] },
      }));
    },

    updateTable: (tableId, updates) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        database: {
          ...bp.database,
          tables: bp.database.tables.map((t) => t.id === tableId ? { ...t, ...updates } : t),
        },
      }));
    },

    removeTable: (tableId) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        database: {
          ...bp.database,
          tables: bp.database.tables.filter((t) => t.id !== tableId),
        },
      }));
    },

    // ── API ────────────────────────────────────────────────────────────────────

    addEndpoint: (endpoint) => {
      const id = generateId('ep');
      const newEndpoint: ApiEndpoint = { ...endpoint, id };
      withHistory(get, set, (bp) => ({
        ...bp,
        api: { ...bp.api, endpoints: [...bp.api.endpoints, newEndpoint] },
      }));
      return newEndpoint;
    },

    updateEndpoint: (endpointId, updates) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        api: {
          ...bp.api,
          endpoints: bp.api.endpoints.map((e) => e.id === endpointId ? { ...e, ...updates } : e),
        },
      }));
    },

    removeEndpoint: (endpointId) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        api: {
          ...bp.api,
          endpoints: bp.api.endpoints.filter((e) => e.id !== endpointId),
        },
      }));
    },

    // ── Business Logic ─────────────────────────────────────────────────────────

    addBusinessFlow: (flow) => {
      const id = generateId('flow');
      const newFlow: BusinessFlow = { ...flow, id };
      withHistory(get, set, (bp) => ({
        ...bp,
        businessLogic: [...bp.businessLogic, newFlow],
      }));
    },

    removeBusinessFlow: (flowId) => {
      withHistory(get, set, (bp) => ({
        ...bp,
        businessLogic: bp.businessLogic.filter((f) => f.id !== flowId),
      }));
    },

    // ── Permissions ────────────────────────────────────────────────────────────

    setPermissions: (permissions) => {
      withHistory(get, set, (bp) => ({ ...bp, permissions }));
    },

    // ── Undo / Redo ────────────────────────────────────────────────────────────

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex <= 0) return;
      const prevIndex = historyIndex - 1;
      const blueprint = parseBlueprint(history[prevIndex]);
      set({ blueprint, historyIndex: prevIndex, isDirty: true });
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex >= history.length - 1) return;
      const nextIndex = historyIndex + 1;
      const blueprint = parseBlueprint(history[nextIndex]);
      set({ blueprint, historyIndex: nextIndex, isDirty: true });
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // ── Full Replace (used by AI engines) ─────────────────────────────────────

    setFullBlueprint: (blueprint) => {
      const snapshot = serializeBlueprint(blueprint);
      const { errors } = validateBlueprint(blueprint);
      set((state) => {
        const truncated = state.history.slice(0, state.historyIndex + 1);
        const newHistory = [...truncated, snapshot].slice(-MAX_HISTORY);
        return {
          blueprint,
          isDirty: true,
          validationErrors: errors,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        };
      });
    },

    mergeBlueprint: (partial) => {
      withHistory(get, set, (bp) => ({ ...bp, ...partial }));
    },

    // ── Selectors ──────────────────────────────────────────────────────────────

    getScreen: (screenId) => {
      return get().blueprint?.screens.find((s) => s.id === screenId);
    },

    getSerializedBlueprint: () => {
      const bp = get().blueprint;
      return bp ? serializeBlueprint(bp) : '{}';
    },

    getValidationErrors: () => get().validationErrors,
  }))
);

// ─── Auto-save Subscription ───────────────────────────────────────────────────

/**
 * Subscribe to blueprint changes and auto-save to the backend.
 * Call this once on app startup (in App.tsx or ProjectWorkspace).
 */
export function setupBlueprintAutoSave(projectId: number, debounceMs = 1500): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const unsubscribe = useBlueprintStore.subscribe(
    (state) => state.isDirty,
    (isDirty) => {
      if (!isDirty) return;

      if (timer) clearTimeout(timer);
      timer = setTimeout(async () => {
        const { blueprint, markSaved } = useBlueprintStore.getState();
        if (!blueprint) return;

        try {
          useBlueprintStore.setState({ isSaving: true });
          const serialized = serializeBlueprint(blueprint);
          await window.electronAPI?.updateBlueprint?.(projectId, serialized);
          markSaved();
        } catch (e) {
          console.error('[BlueprintStore] Auto-save failed:', e);
          useBlueprintStore.setState({ isSaving: false });
        }
      }, debounceMs);
    }
  );

  return () => {
    unsubscribe();
    if (timer) clearTimeout(timer);
  };
}
