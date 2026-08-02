import type { AppBlueprint } from '../../blueprint/schema';
import { BlueprintValidator } from '../validator/BlueprintValidator';

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

  // Project Health Engine parameters
  overallScore: number;
  architectureScore: number;
  uiScore: number;
  backendScore: number;
  databaseScore: number;
  securityScore: number;
  performanceScore: number;
  scalabilityScore: number;
  suggestions: string[];

  apkStatus: 'unbuilt' | 'building' | 'ready' | 'failed';
  warnings: string[];
}

export class AnalyticsManager {
  private validator = new BlueprintValidator();

  /**
   * Computes granular project health metrics and actionable recommendations
   */
  calculateMetrics(blueprint: AppBlueprint): ProjectMetrics {
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // 1. Requirement Completeness
    const reqCount = blueprint.requirementAnswers?.features?.length || blueprint.intentResult?.suggestedFeatures?.length || 0;
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

    // 6. Security Score
    const hasAuth = blueprint.authRequired ?? true;
    const securityScore = hasAuth ? 94 : 75;
    if (!hasAuth) {
      suggestions.push('Improve Authentication: Enable authentication guards and JWT configs.');
    }

    // 7. Performance Score
    const hasPaging = blueprint.api?.endpoints?.some(e => e.path.includes('page') || e.path.includes('size')) ?? false;
    const performanceScore = hasPaging ? 92 : 82;
    if (!hasPaging) {
      suggestions.push('Add Pagination: Implement pagination parameters on list/GET endpoints.');
    }

    // 8. Scalability Score
    const scalabilityScore = tableCount > 5 ? 95 : 88;
    if (tableCount <= 5) {
      suggestions.push('Add Repository Pattern: Structure entity access modules with unified repositories.');
    }

    // Add general caching suggestion if cache is missing
    const hasCache = blueprint.api?.endpoints?.some(e => e.path.includes('cache')) ?? false;
    if (!hasCache) {
      suggestions.push('Add Cache: Implement local/Redis caches for heavy GET query paths.');
    }

    // Add standard try-catch suggestion
    suggestions.push('Add Error Handling: Attach global controller advice and try-catch filters.');

    // Scores
    const architectureScore = blueprintScore;
    const uiScore = uiCoverage;
    const backendScore = backendCoverage;
    const databaseScore = databaseCoverage;

    const overallScore = Math.round(
      (architectureScore + uiScore + backendScore + databaseScore + securityScore + performanceScore + scalabilityScore) / 7
    );

    // Support legacy variables in UI
    const previewScore = uiCoverage;
    const codeQualityScore = databaseCoverage;
    const overallHealth = overallScore;

    const estimatedBuildSuccess = Math.max(50, Math.round(
      (blueprintScore * 0.4) + 
      (requirementCompleteness * 0.3) + 
      (uiCoverage * 0.3)
    ));

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

      overallScore,
      architectureScore,
      uiScore,
      backendScore,
      databaseScore,
      securityScore,
      performanceScore,
      scalabilityScore,
      suggestions,
      
      apkStatus: 'ready',
      warnings
    };
  }
}
