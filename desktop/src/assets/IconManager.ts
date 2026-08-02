export const ICON_MAP = {
  home: 'home',
  profile: 'user',
  settings: 'settings',
  chat: 'message-circle',
  calendar: 'calendar',
  shopping: 'shopping-bag',
  cart: 'shopping-cart',
  search: 'search',
  notifications: 'bell',
  back: 'arrow-left',
  plus: 'plus',
  edit: 'edit-2',
  delete: 'trash-2',
};

export class IconManager {
  static getIcon(name: keyof typeof ICON_MAP, fallback: string = 'star'): string {
    return ICON_MAP[name] || fallback;
  }
}
