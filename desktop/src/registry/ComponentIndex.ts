/**
 * ComponentIndex — Unified registry lookup.
 * All compilers and engines should import from here
 * instead of individual registries.
 */
import { ButtonRegistry } from './ButtonRegistry';
import { InputRegistry } from './InputRegistry';
import { CardRegistry } from './CardRegistry';
import { FormRegistry } from './FormRegistry';
import { ListRegistry } from './ListRegistry';
import { ScreenRegistry } from './ScreenRegistry';
import { LayoutRegistry } from './LayoutRegistry';
import { ThemeRegistry } from './ThemeRegistry';

export type RegistryType = 'button' | 'input' | 'card' | 'form' | 'list' | 'screen' | 'layout' | 'theme';

export class ComponentIndex {

  /**
   * Get a component template by registry type and component name.
   * Returns the raw JSX/TS string template ready to write to file.
   */
  static get(type: RegistryType, name: string): string {
    switch (type) {
      case 'button':  return ButtonRegistry.get(name);
      case 'input':   return InputRegistry.get(name);
      case 'card':    return CardRegistry.get(name);
      case 'form':    return FormRegistry.get(name);
      case 'list':    return ListRegistry.get(name);
      case 'screen':  return ScreenRegistry.get(name);
      case 'layout':  return LayoutRegistry.get(name);
      case 'theme':   return '';
      default:        return '';
    }
  }

  /**
   * List all component names in a registry.
   */
  static list(type: RegistryType): string[] {
    switch (type) {
      case 'button':  return ButtonRegistry.list();
      case 'input':   return InputRegistry.list();
      case 'card':    return CardRegistry.list();
      case 'form':    return FormRegistry.list();
      case 'list':    return ListRegistry.list();
      default:        return [];
    }
  }

  /**
   * Resolve which registry type a component name belongs to.
   */
  static resolve(componentName: string): { type: RegistryType; template: string } | null {
    const checks: [RegistryType, string[]][] = [
      ['button', ButtonRegistry.list()],
      ['input',  InputRegistry.list()],
      ['card',   CardRegistry.list()],
      ['form',   FormRegistry.list()],
      ['list',   ListRegistry.list()],
    ];
    for (const [type, names] of checks) {
      if (names.includes(componentName)) {
        return { type, template: ComponentIndex.get(type, componentName) };
      }
    }
    return null;
  }

  /**
   * Get all components across all registries.
   * Returns a map of componentName → { type, template }
   */
  static getAllComponents(): Record<string, { type: RegistryType; template: string }> {
    const result: Record<string, { type: RegistryType; template: string }> = {};

    const add = (type: RegistryType, registry: Record<string, string>) => {
      Object.keys(registry).forEach(name => {
        result[name] = { type, template: registry[name] };
      });
    };

    add('button', ButtonRegistry.getAll());
    add('input',  InputRegistry.getAll());
    add('card',   CardRegistry.getAll());
    add('form',   FormRegistry.getAll());
    add('list',   ListRegistry.getAll());

    return result;
  }

  /**
   * Get all component names grouped by type.
   */
  static getSummary(): Record<RegistryType, string[]> {
    return {
      button:  ButtonRegistry.list(),
      input:   InputRegistry.list(),
      card:    CardRegistry.list(),
      form:    FormRegistry.list(),
      list:    ListRegistry.list(),
      screen:  [],
      layout:  [],
      theme:   [],
    };
  }
}
