/**
 * AppForge-AI — Navigation Runtime
 * 
 * Manages a screen stack for the preview canvas.
 * Handles push, pop, replace, and tab switching.
 */

export interface NavigationState {
  stack: string[];
  currentScreen: string;
  activeTab: string | null;
  params: Record<string, any>;
}

export class NavigationRuntime {
  private state: NavigationState;
  private listeners: Set<(state: NavigationState) => void> = new Set();

  constructor(initialScreen: string) {
    this.state = {
      stack: [initialScreen],
      currentScreen: initialScreen,
      activeTab: null,
      params: {},
    };
  }

  getCurrentScreen(): string {
    return this.state.currentScreen;
  }

  getStack(): string[] {
    return [...this.state.stack];
  }

  push(screen: string, params?: Record<string, any>): void {
    this.state.stack.push(screen);
    this.state.currentScreen = screen;
    this.state.params = params || {};
    this.notify();
  }

  pop(): string | null {
    if (this.state.stack.length <= 1) return null;
    const removed = this.state.stack.pop()!;
    this.state.currentScreen = this.state.stack[this.state.stack.length - 1];
    this.state.params = {};
    this.notify();
    return removed;
  }

  replace(screen: string, params?: Record<string, any>): void {
    this.state.stack[this.state.stack.length - 1] = screen;
    this.state.currentScreen = screen;
    this.state.params = params || {};
    this.notify();
  }

  switchTab(tab: string): void {
    this.state.activeTab = tab;
    this.state.currentScreen = tab;
    this.notify();
  }

  reset(screen: string): void {
    this.state.stack = [screen];
    this.state.currentScreen = screen;
    this.state.activeTab = null;
    this.state.params = {};
    this.notify();
  }

  getParams(): Record<string, any> {
    return { ...this.state.params };
  }

  subscribe(listener: (state: NavigationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = { ...this.state, stack: [...this.state.stack] };
    this.listeners.forEach(fn => fn(snapshot));
  }
}
