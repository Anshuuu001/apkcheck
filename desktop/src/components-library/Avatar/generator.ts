import type { AvatarSchema } from './schema';

export function generateAvatarReactNative(props: AvatarSchema, theme: string = 'theme'): string {
  const borderRadius = props.shape === 'circle' ? props.size / 2 : 8;
  const imageSource = props.imageUrl ? `{ uri: "${props.imageUrl}" }` : `require('../assets/avatar_placeholder.png')`;

  return `
<Image
  source={${imageSource}}
  style={{
    width: ${props.size},
    height: ${props.size},
    borderRadius: ${borderRadius},
    backgroundColor: ${theme}.colors.surfaceVariant
  }}
/>
  `.trim();
}
