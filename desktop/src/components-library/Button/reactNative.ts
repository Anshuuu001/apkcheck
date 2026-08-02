import type { ButtonProperties } from './properties';

export function generateButtonReactNative(
  props: Partial<ButtonProperties>,
  themeStylesVar = 'theme'
): string {
  const label = props.label || 'Button';
  const variant = props.variant || 'primary';
  const fullWidth = props.fullWidth || false;

  let bgStyle = `${themeStylesVar}.colors.primary`;
  let textStyle = `${themeStylesVar}.colors.onPrimary`;
  let extraStyles = '';

  if (variant === 'outlined') {
    bgStyle = "'transparent'";
    textStyle = `${themeStylesVar}.colors.primary`;
    extraStyles = `, borderWidth: 1.5, borderColor: ${themeStylesVar}.colors.primary`;
  } else if (variant === 'ghost') {
    bgStyle = "'transparent'";
    textStyle = `${themeStylesVar}.colors.onSurface`;
  } else if (variant === 'danger') {
    bgStyle = `${themeStylesVar}.colors.error`;
    textStyle = "'#FFFFFF'";
  }

  return `
<TouchableOpacity
  style={{
    backgroundColor: ${bgStyle},
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: ${themeStylesVar}.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: ${fullWidth ? "'100%'" : "'auto'"}
    ${extraStyles}
  }}
  onPress={onPress}
>
  <Text
    style={{
      color: ${textStyle},
      fontFamily: ${themeStylesVar}.typography.fontFamily,
      fontSize: 14,
      fontWeight: '600',
    }}
  >
    {"${label}"}
  </Text>
</TouchableOpacity>
`.trim();
}
