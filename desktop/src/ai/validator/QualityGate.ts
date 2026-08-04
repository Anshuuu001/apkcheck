import type { AppBlueprint } from '../../blueprint/schema';
import type { VerificationIssue } from './VerificationEngine';

export interface QualityGateResult {
  passed: boolean;
  score: number; // percentage 0-100
  checks: {
    blueprintSchemaValid: boolean;
    previewMockupsRenderable: boolean;
    codeCompilesCleanly: boolean;
    verificationTestsPassed: boolean;
    apkGradleSucceeded: boolean;
  };
  errors: string[];
}

export class QualityGate {
  evaluate(
    blueprint: AppBlueprint,
    issues: VerificationIssue[],
    compilationErrorFree: boolean,
    apkBuildSuccess: boolean
  ): QualityGateResult {
    const errors: string[] = [];

    // Check 1: Blueprint Schema Validity
    const blueprintSchemaValid = !!(
      blueprint.id &&
      blueprint.name &&
      blueprint.packageName &&
      blueprint.theme &&
      blueprint.screens &&
      blueprint.screens.length > 0
    );
    if (!blueprintSchemaValid) {
      errors.push('Quality Gate Fail: Master Blueprint schema configuration is corrupted or incomplete.');
    }

    // Check 2: Preview Mockups Renderable
    const previewMockupsRenderable = blueprint.screens.every(s => s.components && s.components.length > 0);
    if (!previewMockupsRenderable) {
      errors.push('Quality Gate Fail: One or more screens contain no layout components and cannot render preview.');
    }

    // Check 3: Code Compiles Cleanly
    const codeCompilesCleanly = compilationErrorFree;
    if (!codeCompilesCleanly) {
      errors.push('Quality Gate Fail: Code generator compiler output encountered unresolved syntax or import errors.');
    }

    // Check 4: Verification Checks Passed (checks errors severity from VerificationEngine)
    const verificationTestsPassed = !issues.some(i => i.severity === 'error');
    if (!verificationTestsPassed) {
      issues.filter(i => i.severity === 'error').forEach(i => {
        errors.push(`Verification Error [${i.type}]: ${i.message} (in ${i.file || 'unknown file'})`);
      });
    }

    // Check 5: APK Build Succeeded
    const apkGradleSucceeded = apkBuildSuccess;
    if (!apkGradleSucceeded) {
      errors.push('Quality Gate Fail: Android release compilation gradle build did not package correctly.');
    }

    // Calculate score
    let passedCount = 0;
    if (blueprintSchemaValid) passedCount++;
    if (previewMockupsRenderable) passedCount++;
    if (codeCompilesCleanly) passedCount++;
    if (verificationTestsPassed) passedCount++;
    if (apkGradleSucceeded) passedCount++;

    const score = Math.round((passedCount / 5) * 100);
    const passed = passedCount === 5;

    return {
      passed,
      score,
      checks: {
        blueprintSchemaValid,
        previewMockupsRenderable,
        codeCompilesCleanly,
        verificationTestsPassed,
        apkGradleSucceeded
      },
      errors
    };
  }
}
