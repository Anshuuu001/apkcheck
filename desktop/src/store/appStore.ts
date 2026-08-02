import { create } from 'zustand';

export interface User {
  name: string;
  email: string;
  avatar?: string;
  apiKeyGemini?: string;
  apiKeyOpenAI?: string;
  aiProvider?: 'gemini' | 'openai' | 'ollama';
  ollamaUrl?: string;
  ollamaModel?: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  isSidebarCollapsed: boolean;
  currentTab: string;
  isAuthenticated: boolean;
  setTab: (tab: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  login: (email: string, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Load initial state from LocalStorage if in Electron browser simulation or main process settings
const getInitialUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('appforge_user');
    return userJson ? JSON.parse(userJson) : null;
  } catch {
    return null;
  }
};

const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem('appforge_token');
  } catch {
    return null;
  }
};

export const useAppStore = create<AppState>((set) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isSidebarCollapsed: false,
  currentTab: 'dashboard',
  isAuthenticated: !!getInitialToken(),
  
  setTab: (tab) => set({ currentTab: tab }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  
  login: (email, token) => {
    let existingUser: any = null;
    try {
      const userJson = localStorage.getItem('appforge_user');
      if (userJson) existingUser = JSON.parse(userJson);
    } catch {}

    const user: User = { 
      name: email.split('@')[0] || 'User', 
      email, 
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60',
      apiKeyGemini: existingUser?.apiKeyGemini || '',
      apiKeyOpenAI: existingUser?.apiKeyOpenAI || '',
      aiProvider: existingUser?.aiProvider || 'gemini',
      ollamaUrl: existingUser?.ollamaUrl || 'http://127.0.0.1:11434',
      ollamaModel: existingUser?.ollamaModel || 'llama3'
    };
    try {
      localStorage.setItem('appforge_token', token);
      localStorage.setItem('appforge_user', JSON.stringify(user));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
    set({ user, token, isAuthenticated: true, currentTab: 'dashboard' });
  },
  
  logout: () => {
    try {
      localStorage.removeItem('appforge_token');
      localStorage.removeItem('appforge_user');
    } catch (e) {
      console.error('LocalStorage delete error:', e);
    }
    set({ user: null, token: null, isAuthenticated: false, currentTab: 'dashboard' });
  },
  
  updateUser: (updates) => set((state) => {
    const newUser = state.user ? { ...state.user, ...updates } : null;
    if (newUser) {
      try {
        localStorage.setItem('appforge_user', JSON.stringify(newUser));
      } catch (e) {
        console.error('LocalStorage update error:', e);
      }
    }
    return { user: newUser };
  }),
}));
