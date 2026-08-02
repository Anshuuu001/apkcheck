import type { BadgeSchema } from './schema';

export function generateBadgeReactNative(props: BadgeSchema, theme: string = 'theme'): string {
  const max = props.maxCount || 99;
  const colors: Record<string, string> = {
    primary: `${theme}.colors.primary`,
    success: `${theme}.colors.success`,
    error: `${theme}.colors.error`,
    warning: `${theme}.colors.warning`,
  };
  const colorVal = colors[props.variant] || colors.primary;

  return `
<View style={{
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 10,
  backgroundColor: ${colorVal},
  alignSelf: 'flex-start'
}}>
  <Text style={{
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold'
  }}>
    {${props.count} > ${max} ? "${max}+" : ${props.count}}
  </Text>
</View>
  `.trim();
}
