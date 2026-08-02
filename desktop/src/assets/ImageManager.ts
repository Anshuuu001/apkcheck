export const IMAGE_RESOURCES = {
  avatars: {
    doctor: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150',
    patient: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    customer: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  products: {
    shoes: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
  },
  illustrations: {
    welcome: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=600',
  }
};

export class ImageManager {
  static getAvatar(role: keyof typeof IMAGE_RESOURCES.avatars): string {
    return IMAGE_RESOURCES.avatars[role] || IMAGE_RESOURCES.avatars.customer;
  }

  static getProductPlaceholder(item: keyof typeof IMAGE_RESOURCES.products): string {
    return IMAGE_RESOURCES.products[item] || IMAGE_RESOURCES.illustrations.welcome;
  }
}
