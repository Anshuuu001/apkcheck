export class CanvasHistory<T> {
  private past: T[] = [];
  private present: T;
  private future: T[] = [];

  constructor(initialState: T) {
    this.present = initialState;
  }

  getPresent(): T {
    return this.present;
  }

  push(state: T): void {
    this.past.push(this.present);
    this.present = state;
    this.future = [];
  }

  undo(): T | null {
    if (this.past.length === 0) return null;
    const previous = this.past.pop()!;
    this.future.unshift(this.present);
    this.present = previous;
    return this.present;
  }

  redo(): T | null {
    if (this.future.length === 0) return null;
    const next = this.future.shift()!;
    this.past.push(this.present);
    this.present = next;
    return this.present;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  clear(): void {
    this.past = [];
    this.future = [];
  }
}
