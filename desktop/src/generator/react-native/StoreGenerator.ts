import type { AppBlueprint } from '../../blueprint/schema';

export class StoreGenerator {
  static generate(blueprint: AppBlueprint): string {
    return `import { create } from 'zustand';

interface AppState {
  user: any | null;
  token: string | null;
  themeMode: 'light' | 'dark';
  setThemeMode: (mode: 'light' | 'dark') => void;
  login: (user: any, token: string) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  themeMode: '${blueprint.theme.mode || 'dark'}',
  setThemeMode: (mode) => set({ themeMode: mode }),
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
`;
  }
}
