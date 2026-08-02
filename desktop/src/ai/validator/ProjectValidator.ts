import type { Project } from '../../main/database';

export interface ProjectValidationResult {
  valid: boolean;
  errors: string[];
}

export class ProjectValidator {
  /**
   * Evaluates project settings configurations
   */
  validate(project: Project): ProjectValidationResult {
    const errors: string[] = [];

    if (!project.name || project.name.trim() === '') {
      errors.push('Project validation error: Name string cannot be empty.');
    }

    try {
      const settings = JSON.parse(project.settings || '{}');
      if (settings.aiProvider === 'openai' && !settings.apiKeyOpenAI) {
        errors.push('Project validation warning: OpenAI provider selected but key is empty.');
      }
    } catch (e) {
      errors.push('Project validation error: Invalid settings JSON data format.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
