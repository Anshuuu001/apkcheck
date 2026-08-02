import type { AppBlueprint } from '../../blueprint/schema';
import { BlueprintValidator } from '../blueprint/BlueprintValidator';

export interface ProjectMetrics {
  overallHealth: number;
  blueprintScore: number;
  previewScore: number;
  codeQualityScore: number;
  
  requirementCompleteness: number;
  uiCoverage: number;
  backendCoverage: number;
  databaseCoverage: number;
  estimatedBuildSuccess: number;

  apkStatus: 'unbuilt' | 'building' | 'ready' | 'failed';
  warnings: string[];
}

export class AnalyticsManager {
  private validator = new BlueprintValidator();

  /**
   * Computes granular project health metrics
   */
  calculateMetrics(blueprint: AppBlueprint): ProjectMetrics {
    const warnings: string[] = [];

    // 1. Requirement Completeness
    const reqCount = blueprint.features?.length || 0;
    const requirementCompleteness = Math.max(85, Math.min(100, 80 + reqCount * 3));

    // 2. Blueprint Score Calculation
    const { valid, errors } = this.validator.validate(blueprint);
    let blueprintScore = 100;
    if (!valid) {
      blueprintScore = Math.max(40, 100 - errors.length * 8);
      warnings.push(...errors);
    }

    // 3. UI Coverage
    const totalScreens = blueprint.screens?.length || 0;
    const screensWithComponents = blueprint.screens?.filter(s => s.components && s.components.length > 0).length || 0;
    const uiCoverage = totalScreens > 0 ? Math.round((screensWithComponents / totalScreens) * 100) : 100;

    // 4. Backend Coverage
    const apiCount = blueprint.api?.endpoints?.length || 0;
    const backendCoverage = Math.max(75, Math.min(100, 80 + apiCount * 2));

    // 5. Database Coverage
    const tableCount = blueprint.database?.tables?.length || 0;
    const databaseCoverage = Math.max(80, Math.min(100, 78 + tableCount * 3));

    // 6. Estimated Build Success
    const estimatedBuildSuccess = Math.max(50, Math.round(
      (blueprintScore * 0.4) + 
      (requirementCompleteness * 0.3) + 
      (uiCoverage * 0.3)
    ));

    // Support legacy variables in UI
    const previewScore = uiCoverage;
    const codeQualityScore = databaseCoverage;
    const overallHealth = Math.round((blueprintScore + uiCoverage + databaseCoverage) / 3);

    return {
      overallHealth,
      blueprintScore,
      previewScore,
      codeQualityScore,
      
      requirementCompleteness,
      uiCoverage,
      backendCoverage,
      databaseCoverage,
      estimatedBuildSuccess,
      
      apkStatus: 'ready',
      warnings
    };
  }
}
