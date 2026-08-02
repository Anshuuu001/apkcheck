export interface RequirementValidationResult {
  valid: boolean;
  errors: string[];
}

export class RequirementValidator {
  /**
   * Validates requirement responses before blueprint planning begins
   */
  validate(features: string[], userRoles: string[]): RequirementValidationResult {
    const errors: string[] = [];

    if (!features || features.length === 0) {
      errors.push('Requirements validation failed: You must choose or define at least one feature module.');
    }

    if (!userRoles || userRoles.length === 0) {
      errors.push('Requirements validation failed: You must specify at least one user dashboard role.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
