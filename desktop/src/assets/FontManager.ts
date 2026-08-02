export const AVAILABLE_FONTS = [
  'Inter',
  'Roboto',
  'Outfit',
  'Plus Jakarta Sans',
  'Playfair Display',
  'Fira Code',
];

export class FontManager {
  static getFontsList(): string[] {
    return [...AVAILABLE_FONTS];
  }

  static getDefaultFont(): string {
    return 'Inter';
  }
}
