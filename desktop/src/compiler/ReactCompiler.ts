import type { ScreenBlueprint } from '../blueprint/schema';
import { ScreenRegistry } from '../registry/ScreenRegistry';
import { ButtonRegistry } from '../registry/ButtonRegistry';
import { InputRegistry } from '../registry/InputRegistry';

export class ReactCompiler {
  /**
   * Renders the complete React Native frontend project modules map
   */
  static compile(screens: ScreenBlueprint[]): Record<string, string> {
    const files: Record<string, string> = {};

    // 1. Renders screens code
    screens.forEach(screen => {
      files[`src/screens/${screen.name}.tsx`] = ScreenRegistry.get(screen.name);
    });

    // 2. Renders component registry files
    files['src/components/PrimaryButton.tsx'] = ButtonRegistry.get('PrimaryButton');
    files['src/components/SecondaryButton.tsx'] = ButtonRegistry.get('SecondaryButton');
    files['src/components/TextInputField.tsx'] = InputRegistry.get('TextInputField');

    return files;
  }
}
