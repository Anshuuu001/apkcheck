import type { ChipSchema } from './schema';

export function generateChipReactNative(props: ChipSchema, theme: string = 'theme'): string {
  const bgVal = props.selected ? `${theme}.colors.primary` : `${theme}.colors.surface`;
  const textVal = props.selected ? '#FFF' : `${theme}.colors.onSurface`;
  const borderVal = props.selected ? `${theme}.colors.primary` : `${theme}.colors.divider`;
  const clickHandler = props.onPressAction ? `onPress={() => emit("${props.onPressAction}")}` : '';

  return `
<TouchableOpacity
  ${clickHandler}
  style={{
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: ${bgVal},
    borderWidth: 1,
    borderColor: ${borderVal},
    marginRight: 6,
    marginBottom: 6,
    alignSelf: 'flex-start'
  }}
>
  <Text style={{
    color: ${textVal},
    fontSize: 12,
    fontWeight: 'bold'
  }}>
    ${props.label}
  </Text>
</TouchableOpacity>
  `.trim();
}
