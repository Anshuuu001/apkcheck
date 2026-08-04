import type { CardProperties } from './properties';

export function generateCardReactNative(
  props: Partial<CardProperties>,
  childrenContent?: string,
  themeStylesVar = 'theme'
): string {
  const elevation = props.elevation || 'md';
  const padding = props.padding ?? 14;

  let shadowStyles = '';
  if (elevation === 'sm') {
    shadowStyles = "shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.0, elevation: 1";
  } else if (elevation === 'md') {
    shadowStyles = "shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5";
  } else if (elevation === 'lg') {
    shadowStyles = "shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.34, shadowRadius: 6.27, elevation: 10";
  } else if (elevation === 'xl') {
    shadowStyles = "shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.51, shadowRadius: 13.16, elevation: 20";
  }

  return `
<View
  style={{
    backgroundColor: ${themeStylesVar}.colors.surface,
    borderRadius: ${themeStylesVar}.borderRadius.xl,
    padding: ${padding},
    marginVertical: 6,
    ${shadowStyles}
  }}
>
  ${childrenContent || `<View style={{ height: 12, borderRadius: 6, backgroundColor: ${themeStylesVar}.colors.surfaceVariant, width: '70%', marginBottom: 6 }} />
  <View style={{ height: 8, borderRadius: 4, backgroundColor: ${themeStylesVar}.colors.divider, width: '50%' }} />`}
</View>
`.trim();
}
