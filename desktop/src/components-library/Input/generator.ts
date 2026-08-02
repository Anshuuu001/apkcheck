import type { InputSchema } from './schema';

export function generateInputReactNative(props: InputSchema, theme: string = 'theme'): string {
  const keyboardType = props.keyboardType === 'default' ? '' : `keyboardType="${props.keyboardType}"`;
  
  return `
<View style={{ marginBottom: 12 }}>
  <Text style={{ fontSize: 12, fontWeight: 'bold', color: ${theme}.colors.onBackground, marginBottom: 4 }}>${props.label}</Text>
  <TextInput
    placeholder="${props.placeholder}"
    placeholderTextColor="#666"
    ${keyboardType}
    style={{
      padding: 10,
      borderRadius: ${theme}.borderRadius.md,
      borderWidth: 1,
      borderColor: ${theme}.colors.divider,
      color: ${theme}.colors.onSurface,
      backgroundColor: ${theme}.colors.surface
    }}
  />
</View>
  `.trim();
}
