import type { ComponentBlueprint } from '../../blueprint/schema';
import { COMPONENT_REGISTRY, type ComponentLibraryType } from '../../components-library';

export function generateComponentCode(comp: ComponentBlueprint): string {
  const registryType = comp.type as ComponentLibraryType;
  const match = COMPONENT_REGISTRY[registryType];

  if (match) {
    // Generate children components recursively
    let childrenContent = '';
    if (comp.children && comp.children.length > 0) {
      childrenContent = comp.children.map(c => generateComponentCode(c)).join('\n');
    }
    return match.generateReactNative(comp.props, childrenContent);
  }

  // Fallback to basic View if component is custom or mapping is not found
  return `
<View style={{ marginVertical: 6, padding: 10, backgroundColor: '#EEEEEE', borderRadius: 8 }}>
  <Text style={{ fontWeight: 'bold' }}>[Fallback: ${comp.type}]</Text>
  ${comp.children ? comp.children.map(c => generateComponentCode(c)).join('\n') : ''}
</View>
  `.trim();
}
