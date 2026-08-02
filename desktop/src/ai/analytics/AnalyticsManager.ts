import type { AppBlueprint, ProjectReviewReport, ReviewCategory, ReviewIssue, ReviewSuggestion } from '../../blueprint/schema';
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

    const hasCache = blueprint.api?.endpoints?.some(e => e.path.includes('cache')) ?? false;
    if (!hasCache) {
      suggestions.push('Add Cache: Implement local/Redis caches for heavy GET query paths.');
    }

    suggestions.push('Add Error Handling: Attach global controller advice and try-catch filters.');

    const architectureScore = blueprintScore;
    const uiScore = uiCoverage;
    const backendScore = backendCoverage;
    const databaseScore = databaseCoverage;

    const overallScore = Math.round(
      (architectureScore + uiScore + backendScore + databaseScore + securityScore + performanceScore + scalabilityScore) / 7
    );

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

  /**
   * Step 8 — AI Project Reviewer
   * Full structured review report with per-category issues and prioritized suggestions.
   */
  generateFullReport(blueprint: AppBlueprint): ProjectReviewReport {
    const metrics = this.calculateMetrics(blueprint);
    const apiCount = blueprint.api?.endpoints?.length ?? 0;
    const tableCount = blueprint.database?.tables?.length ?? 0;
    const totalScreens = blueprint.screens?.length ?? 0;
    const screensWithComponents = blueprint.screens?.filter(s => s.components?.length > 0).length ?? 0;

    // Security
    const securityIssues: ReviewIssue[] = [];
    if (!blueprint.authRequired) {
      securityIssues.push({ severity: 'high', description: 'No authentication enabled', location: 'App Config', suggestion: 'Enable JWT authentication with role-based guards' });
    }
    const hasLoginEndpoint = blueprint.api?.endpoints?.some(e => e.path.toLowerCase().includes('login'));
    if (!hasLoginEndpoint) {
      securityIssues.push({ severity: 'high', description: 'No login endpoint defined', location: 'API Blueprint', suggestion: 'Add POST /auth/login endpoint' });
    }
    const hasRateLimit = blueprint.api?.endpoints?.some(e => e.description?.includes('rate'));
    if (!hasRateLimit) {
      securityIssues.push({ severity: 'medium', description: 'No rate limiting configured', location: 'API Layer', suggestion: 'Add rate limiting on auth endpoints' });
    }

    // Performance
    const performanceIssues: ReviewIssue[] = [];
    const hasPaging = blueprint.api?.endpoints?.some(e => e.path.includes('page'));
    if (!hasPaging) {
      performanceIssues.push({ severity: 'medium', description: 'No pagination on list endpoints', location: 'API Blueprint', suggestion: 'Add ?page=&limit= to GET list endpoints' });
    }
    if (tableCount > 3) {
      const tablesNoIndex = blueprint.database?.tables?.filter(t => !t.indexes?.length) ?? [];
      if (tablesNoIndex.length > 0) {
        performanceIssues.push({ severity: 'medium', description: `${tablesNoIndex.length} table(s) have no custom indexes`, location: 'Database', suggestion: 'Add indexes on status, email, created_at columns' });
      }
    }

    // Architecture
    const architectureIssues: ReviewIssue[] = [];
    if (totalScreens === 0) {
      architectureIssues.push({ severity: 'high', description: 'No screens defined in Blueprint', location: 'Blueprint', suggestion: 'Add screen blueprints for compilation' });
    }
    if (apiCount === 0) {
      architectureIssues.push({ severity: 'high', description: 'No API endpoints defined', location: 'API Blueprint', suggestion: 'Define CRUD endpoints per entity' });
    }

    // Database
    const databaseIssues: ReviewIssue[] = [];
    const hasUserTable = blueprint.database?.tables?.some(t => t.name.toLowerCase().includes('user'));
    if (blueprint.authRequired && !hasUserTable) {
      databaseIssues.push({ severity: 'high', description: 'Auth required but no Users table', location: 'Database', suggestion: 'Add Users table with email, password_hash, role, status' });
    }

    // UI
    const uiIssues: ReviewIssue[] = [];
    const screensEmpty = totalScreens - screensWithComponents;
    if (screensEmpty > 0) {
      uiIssues.push({ severity: 'medium', description: `${screensEmpty} screen(s) have no components`, location: 'Screen Blueprint', suggestion: 'Add component blueprints to all screens' });
    }
    const hasLoadingState = blueprint.screens?.some(s => s.stateVariables?.some(v => v.name === 'loading'));
    if (!hasLoadingState) {
      uiIssues.push({ severity: 'low', description: 'No loading states on API-connected screens', location: 'Screen Blueprint', suggestion: 'Add loading state variables to async screens' });
    }

    // Accessibility
    const a11yIssues: ReviewIssue[] = [
      { severity: 'low', description: 'Missing accessibility labels on interactive components', location: 'Screen Blueprint', suggestion: 'Add accessibilityLabel and accessibilityRole to buttons and inputs' },
      { severity: 'low', description: 'Minimum touch target size not enforced', location: 'Theme Blueprint', suggestion: 'Ensure 44x44 minimum touch targets per accessibility guidelines' },
    ];

    // Suggestions
    const suggestions: ReviewSuggestion[] = [];
    if (securityIssues.some(i => i.severity === 'high')) {
      suggestions.push({ priority: 'HIGH', action: 'Implement JWT Authentication', module: 'Auth', impact: 'Prevents unauthorized access to protected endpoints' });
    }
    if (!hasPaging) {
      suggestions.push({ priority: 'MEDIUM', action: 'Add API Pagination', module: 'API Layer', impact: 'Reduces server load on list endpoints' });
    }
    suggestions.push({ priority: 'MEDIUM', action: 'Add Redis Caching', module: 'Backend', impact: 'Reduces DB load by 40-60% on read-heavy operations' });
    suggestions.push({ priority: 'LOW', action: 'Add Crash Reporting (Sentry)', module: 'React Native', impact: 'Production error tracking and monitoring' });
    suggestions.push({ priority: 'LOW', action: 'Write Unit Tests', module: 'Testing', impact: 'Increases code confidence and prevents regressions' });

    const overall = Math.round(
      (metrics.securityScore + metrics.performanceScore + metrics.architectureScore +
       metrics.databaseScore + metrics.uiScore + Math.max(60, 100 - a11yIssues.length * 8)) / 6
    );

    return {
      overall: Math.min(100, Math.max(0, overall)),
      security:      { score: metrics.securityScore,      issues: securityIssues },
      performance:   { score: metrics.performanceScore,   issues: performanceIssues },
      architecture:  { score: metrics.architectureScore,  issues: architectureIssues },
      database:      { score: metrics.databaseScore,      issues: databaseIssues },
      ui:            { score: metrics.uiScore,            issues: uiIssues },
      accessibility: { score: Math.max(60, 100 - a11yIssues.length * 15), issues: a11yIssues },
      suggestions,
      generatedAt: new Date().toISOString(),
    };
  }
}
