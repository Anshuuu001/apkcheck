export class ReasoningEngine {
  /**
   * Resolves constraints and automatically infers/injects missing features
   * based on user idea keywords (e.g. restaurant suggests Menu, Orders, Kitchen, etc.)
   */
  inferModules(idea: string, baseModules: string[]): string[] {
    const resolved = new Set(baseModules);
    const ideaLower = idea.toLowerCase();

    // 1. Keyword-based offline reasoning inference rules
    if (ideaLower.includes('restaurant') || ideaLower.includes('food') || ideaLower.includes('delivery') || ideaLower.includes('cafe')) {
      ['MenuSelection', 'CartDetails', 'OrderTracking', 'restaurants', 'menu_items', 'orders', 'DeliveryPartner', 'Payments'].forEach(m => resolved.add(m));
    }
    
    if (ideaLower.includes('hospital') || ideaLower.includes('doctor') || ideaLower.includes('medical') || ideaLower.includes('clinic')) {
      ['DoctorDashboard', 'PatientDashboard', 'AppointmentBooking', 'appointments', 'prescriptions', 'billing'].forEach(m => resolved.add(m));
    }

    if (ideaLower.includes('ecommerce') || ideaLower.includes('shop') || ideaLower.includes('store') || ideaLower.includes('buy')) {
      ['ProductListing', 'ProductDetails', 'ShoppingCart', 'CheckoutProgress', 'products', 'categories', 'orders'].forEach(m => resolved.add(m));
    }

    // 2. Structural/Referential dependency rules
    if (resolved.has('CartDetails') || resolved.has('ShoppingCart') || resolved.has('Shopping Cart')) {
      resolved.add('CheckoutProgress');
    }
    if (resolved.has('CheckoutProgress') || resolved.has('Checkout')) {
      resolved.add('Authentication');
    }

    return Array.from(resolved);
  }

  resolveConstraints(modules: string[]): string[] {
    const resolved = new Set(modules);
    if (resolved.has('Checkout') && !resolved.has('Shopping Cart')) {
      resolved.add('Shopping Cart');
    }
    return Array.from(resolved);
  }
}
