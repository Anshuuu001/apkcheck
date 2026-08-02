import type { IndustryType } from '../../blueprint/schema';

export interface BusinessRule {
  trigger: string;
  action: string;
  validationRule?: string;
}

export class BusinessLogicEngine {
  /**
   * Generates standard business rules and flow overrides based on the industry and selected features.
   */
  getRules(industry: IndustryType, features: string[]): BusinessRule[] {
    const rules: BusinessRule[] = [];

    // Common authentication rule
    rules.push({
      trigger: 'onAppLaunch',
      action: 'checkAuthentication',
      validationRule: 'sessionToken != null'
    });

    if (features.includes('cart') || features.includes('billing')) {
      rules.push({
        trigger: 'onCheckoutPress',
        action: 'validatePaymentMethod',
        validationRule: 'selectedPaymentMethod != null'
      });
    }

    if (industry === 'Healthcare') {
      rules.push({
        trigger: 'onBookAppointment',
        action: 'verifyDoctorAvailability',
        validationRule: 'selectedSlot.isFree == true'
      });
    }

    if (industry === 'E-Commerce') {
      rules.push({
        trigger: 'onAddToCart',
        action: 'checkInventoryLevel',
        validationRule: 'product.stockCount > 0'
      });
    }

    return rules;
  }
}
