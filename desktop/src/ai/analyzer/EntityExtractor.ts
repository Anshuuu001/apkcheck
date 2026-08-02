import type { IndustryType } from '../../blueprint/schema';

export const INDUSTRY_ROLES: Record<IndustryType, string[]> = {
  'Healthcare': ['Doctor', 'Patient', 'Admin', 'Nurse', 'Pharmacist', 'Receptionist'],
  'Education': ['Student', 'Teacher', 'Admin', 'Parent', 'Principal'],
  'E-Commerce': ['Customer', 'Seller', 'Admin', 'Delivery Agent'],
  'Food & Delivery': ['Customer', 'Restaurant Owner', 'Delivery Driver', 'Admin'],
  'Transportation': ['Passenger', 'Driver', 'Admin', 'Dispatcher'],
  'Finance & Banking': ['Customer', 'Bank Agent', 'Admin', 'Auditor'],
  'Real Estate': ['Buyer', 'Seller', 'Agent', 'Admin'],
  'Social Media': ['User', 'Creator', 'Moderator', 'Admin'],
  'Fitness & Health': ['Member', 'Trainer', 'Admin', 'Nutritionist'],
  'Entertainment': ['User', 'Creator', 'Moderator', 'Admin'],
  'CRM & Business': ['Sales Rep', 'Manager', 'Customer', 'Admin'],
  'Chat & Communication': ['User', 'Admin', 'Moderator'],
  'Travel & Tourism': ['Traveler', 'Agent', 'Hotel Manager', 'Admin'],
  'Agriculture': ['Farmer', 'Buyer', 'Expert', 'Admin'],
  'Manufacturing': ['Worker', 'Manager', 'Quality Inspector', 'Admin'],
  'Custom': ['User', 'Admin'],
};

export class EntityExtractor {
  extractRoles(idea: string, industry: IndustryType): string[] {
    const lower = idea.toLowerCase();
    const defaults = INDUSTRY_ROLES[industry] || ['User', 'Admin'];
    
    // Explicitly scan the user idea for any mentions of common roles
    const detected = defaults.filter(role => 
      lower.includes(role.toLowerCase()) || 
      lower.includes(role.toLowerCase() + 's') // plural forms
    );

    // If we detected specific roles, make sure Admin is always available if needed,
    // otherwise default to standard industry roles list.
    if (detected.length > 0) {
      if (!detected.includes('Admin') && defaults.includes('Admin')) {
        detected.push('Admin');
      }
      return Array.from(new Set(detected));
    }

    // Default to first 3 roles of industry defaults if none explicitly detected
    return defaults.slice(0, 3);
  }
}
