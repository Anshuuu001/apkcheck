import * as fs from 'fs';
import * as path from 'path';

export interface GenerationValidationResult {
  valid: boolean;
  errors: string[];
}

export class GenerationValidator {
  /**
   * Performs validation on the generated source directories
   */
  validate(projectPath: string, generators: ('react-native' | 'spring-boot')[]): GenerationValidationResult {
    const errors: string[] = [];

    if (!fs.existsSync(projectPath)) {
      errors.push(`Generation validation error: Target path "${projectPath}" does not exist.`);
      return { valid: false, errors };
    }

    if (generators.includes('react-native')) {
      const rnPath = path.join(projectPath, 'mobile');
      if (!fs.existsSync(rnPath)) {
        errors.push('Missing folder: Generated React Native "mobile" directory not found.');
      } else {
        const packageJson = path.join(rnPath, 'package.json');
        if (!fs.existsSync(packageJson)) {
          errors.push('Missing file: React Native package.json file not generated.');
        }
      }
    }

    if (generators.includes('spring-boot')) {
      const sbPath = path.join(projectPath, 'backend');
      if (!fs.existsSync(sbPath)) {
        errors.push('Missing folder: Generated Spring Boot "backend" directory not found.');
      } else {
        const pomXml = path.join(sbPath, 'pom.xml');
        if (!fs.existsSync(pomXml)) {
          errors.push('Missing file: Spring Boot Maven pom.xml configuration not generated.');
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
