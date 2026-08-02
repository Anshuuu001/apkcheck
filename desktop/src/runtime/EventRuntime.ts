/**
 * AppForge-AI — Event Runtime
 * 
 * Event bus for component interactions in the preview canvas.
 * Maps blueprint eventHandlers (e.g., onPress: 'auth:login') to runtime actions.
 */

export type EventHandler = (payload?: any) => void;

export interface EventBinding {
  eventId: string;
  componentId: string;
  action: string;
}

export class EventRuntime {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private bindings: EventBinding[] = [];

  /**
   * Register a handler for a named event action.
   * e.g., register('auth:login', () => { ... })
   */
  register(action: string, handler: EventHandler): () => void {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, new Set());
    }
    this.handlers.get(action)!.add(handler);
    return () => this.handlers.get(action)?.delete(handler);
  }

  /**
   * Emit an event, triggering all registered handlers.
   */
  emit(action: string, payload?: any): void {
    const handlers = this.handlers.get(action);
    if (handlers) {
      handlers.forEach(fn => fn(payload));
    }

    // Also emit to wildcard listeners
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(fn => fn({ action, payload }));
    }
  }

  /**
   * Bind a component's event handler to an action.
   * This creates a mapping from the blueprint's eventHandlers to runtime actions.
   */
  bind(componentId: string, eventId: string, action: string): void {
    this.bindings.push({ eventId, componentId, action });
  }

  /**
   * Get the action bound to a component's event.
   */
  getAction(componentId: string, eventId: string): string | null {
    const binding = this.bindings.find(b => b.componentId === componentId && b.eventId === eventId);
    return binding?.action || null;
  }

  /**
   * Handle a component event by looking up its binding and emitting.
   */
  handleComponentEvent(componentId: string, eventId: string, payload?: any): void {
    const action = this.getAction(componentId, eventId);
    if (action) {
      this.emit(action, payload);
    }
  }

  /**
   * Clear all handlers and bindings.
   */
  reset(): void {
    this.handlers.clear();
    this.bindings = [];
  }
}
