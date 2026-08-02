/**
 * AppForge-AI — State Runtime
 * 
 * Lightweight reactive state store for the preview canvas.
 * Components read/write state keys. Changes trigger re-renders.
 */

export type StateListener = (key: string, value: any) => void;

export class StateRuntime {
  private store: Map<string, any> = new Map();
  private listeners: Map<string, Set<StateListener>> = new Map();
  private globalListeners: Set<StateListener> = new Set();

  get(key: string, defaultValue?: any): any {
    return this.store.has(key) ? this.store.get(key) : defaultValue;
  }

  set(key: string, value: any): void {
    this.store.set(key, value);
    // Notify key-specific listeners
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(fn => fn(key, value));
    }
    // Notify global listeners
    this.globalListeners.forEach(fn => fn(key, value));
  }

  toggle(key: string): void {
    this.set(key, !this.get(key, false));
  }

  increment(key: string, amount: number = 1): void {
    this.set(key, (this.get(key, 0) as number) + amount);
  }

  append(key: string, item: any): void {
    const list = this.get(key, []) as any[];
    this.set(key, [...list, item]);
  }

  remove(key: string): void {
    this.store.delete(key);
  }

  reset(): void {
    this.store.clear();
    this.globalListeners.forEach(fn => fn('__reset__', null));
  }

  /**
   * Subscribe to changes on a specific key.
   */
  watch(key: string, listener: StateListener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);
    return () => this.listeners.get(key)?.delete(listener);
  }

  /**
   * Subscribe to all state changes.
   */
  watchAll(listener: StateListener): () => void {
    this.globalListeners.add(listener);
    return () => this.globalListeners.delete(listener);
  }

  /**
   * Get a snapshot of all state for debugging.
   */
  snapshot(): Record<string, any> {
    const obj: Record<string, any> = {};
    this.store.forEach((value, key) => { obj[key] = value; });
    return obj;
  }
}
