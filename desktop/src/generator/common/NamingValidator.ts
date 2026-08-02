export class NamingValidator {
  /**
   * Asserts variables and component naming conventions match style rules.
   */
  validateVariableName(name: string): boolean {
    // Camel case check
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  }

  validateComponentName(name: string): boolean {
    // Pascal case check
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  }

  validateDatabaseTableName(name: string): boolean {
    // snake_case check
    return /^[a-z][a-z0-9_]*$/.test(name);
  }
}
