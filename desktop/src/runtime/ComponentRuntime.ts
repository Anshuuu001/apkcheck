/**
 * AppForge-AI — Component Runtime
 * 
 * Registers component types with their default preview behaviors.
 * When the preview renders a Button, Input, or Toggle, the ComponentRuntime
 * defines how they react to user interaction.
 */

export interface ComponentBehavior {
  type: string;
  defaultProps: Record<string, any>;
  interactable: boolean;
  onInteract?: string; // Default event action name
  stateKey?: string;   // State key this component reads/writes
}

export class ComponentRuntime {
  private registry: Map<string, ComponentBehavior> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults(): void {
    // Interactive components
    this.register({ type: 'Button', defaultProps: { variant: 'primary' }, interactable: true, onInteract: 'button:press' });
    this.register({ type: 'TextField', defaultProps: { placeholder: '' }, interactable: true, stateKey: 'input' });
    this.register({ type: 'PasswordField', defaultProps: { placeholder: '' }, interactable: true, stateKey: 'password' });
    this.register({ type: 'Toggle', defaultProps: { value: false }, interactable: true, stateKey: 'toggle' });
    this.register({ type: 'Checkbox', defaultProps: { checked: false }, interactable: true, stateKey: 'checkbox' });
    this.register({ type: 'SearchBar', defaultProps: { placeholder: 'Search...' }, interactable: true, stateKey: 'search' });
    this.register({ type: 'ChatInput', defaultProps: { placeholder: 'Type a message...' }, interactable: true, stateKey: 'message' });
    this.register({ type: 'SocialAuthButton', defaultProps: { provider: 'google' }, interactable: true, onInteract: 'auth:social' });
    this.register({ type: 'FAB', defaultProps: { icon: 'plus' }, interactable: true, onInteract: 'fab:press' });

    // Display components
    this.register({ type: 'Heading', defaultProps: { level: 'h2' }, interactable: false });
    this.register({ type: 'Text', defaultProps: {}, interactable: false });
    this.register({ type: 'Image', defaultProps: { size: 100 }, interactable: false });
    this.register({ type: 'Avatar', defaultProps: { size: 48 }, interactable: false });
    this.register({ type: 'Badge', defaultProps: { count: 0 }, interactable: false });
    this.register({ type: 'Divider', defaultProps: {}, interactable: false });
    this.register({ type: 'LoadingSpinner', defaultProps: { size: 'medium' }, interactable: false });

    // Container components
    this.register({ type: 'Card', defaultProps: { elevation: 'md' }, interactable: false });
    this.register({ type: 'Container', defaultProps: {}, interactable: false });
    this.register({ type: 'ScrollView', defaultProps: {}, interactable: false });
    this.register({ type: 'Row', defaultProps: { gap: 8 }, interactable: false });
    this.register({ type: 'Grid', defaultProps: { columns: 2 }, interactable: false });

    // Navigation components
    this.register({ type: 'TopBar', defaultProps: { title: '' }, interactable: false });
    this.register({ type: 'BottomNavigation', defaultProps: {}, interactable: true, onInteract: 'nav:switch' });
    this.register({ type: 'TabBar', defaultProps: {}, interactable: true, onInteract: 'tab:switch' });
    this.register({ type: 'Drawer', defaultProps: {}, interactable: true, onInteract: 'drawer:toggle' });

    // Data components
    this.register({ type: 'StatCard', defaultProps: {}, interactable: false });
    this.register({ type: 'Table', defaultProps: {}, interactable: false });
    this.register({ type: 'ListItem', defaultProps: {}, interactable: true, onInteract: 'list:select' });
    this.register({ type: 'ListTile', defaultProps: {}, interactable: true, onInteract: 'list:select' });

    // Chart components
    this.register({ type: 'LineChart', defaultProps: {}, interactable: false });
    this.register({ type: 'BarChart', defaultProps: {}, interactable: false });
    this.register({ type: 'PieChart', defaultProps: {}, interactable: false });

    // Specialized components
    this.register({ type: 'Calendar', defaultProps: {}, interactable: true, stateKey: 'selectedDate' });
    this.register({ type: 'MapView', defaultProps: {}, interactable: false });
    this.register({ type: 'MessageList', defaultProps: {}, interactable: false });
    this.register({ type: 'NotificationCard', defaultProps: {}, interactable: true, onInteract: 'notification:tap' });
    this.register({ type: 'ProductCard', defaultProps: {}, interactable: true, onInteract: 'product:select' });
    this.register({ type: 'CartItem', defaultProps: {}, interactable: true, onInteract: 'cart:modify' });
    this.register({ type: 'OrderSummary', defaultProps: {}, interactable: false });
    this.register({ type: 'PaymentForm', defaultProps: {}, interactable: true, stateKey: 'payment' });
  }

  register(behavior: ComponentBehavior): void {
    this.registry.set(behavior.type, behavior);
  }

  get(type: string): ComponentBehavior | undefined {
    return this.registry.get(type);
  }

  isInteractable(type: string): boolean {
    return this.registry.get(type)?.interactable || false;
  }

  getDefaultAction(type: string): string | null {
    return this.registry.get(type)?.onInteract || null;
  }

  getStateKey(type: string): string | null {
    return this.registry.get(type)?.stateKey || null;
  }

  getAllTypes(): string[] {
    return Array.from(this.registry.keys());
  }
}
