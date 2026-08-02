import { CompilerLogReader, type ParsedError } from './CompilerLogReader';
import { ErrorClassifier } from './ErrorClassifier';
import { FixPlanner, type DebugFixPlan } from './FixPlanner';
import { PatchGenerator, type FilePatch } from './PatchGenerator';

export interface DebugReport {
  success: boolean;
  attempts: number;
  fixedErrorsCount: number;
  unresolvedErrors: ParsedError[];
  appliedPatches: FilePatch[];
}

export class RetryManager {
  private logReader = new CompilerLogReader();
  private classifier = new ErrorClassifier();
  private planner = new FixPlanner();
  private patcher = new PatchGenerator();

  /**
   * Orchestrates retry iteration loops
   */
  async runDebugCycle(
    initialLogs: string,
    maxAttempts: number = 3,
    fileLoader: (path: string) => Promise<string>,
    fileSaver: (path: string, content: string) => Promise<void>,
    buildTrigger: () => Promise<{ success: boolean; logs: string }>
  ): Promise<DebugReport> {
    let currentLogs = initialLogs;
    let attempts = 0;
    const appliedPatches: FilePatch[] = [];
    let fixedErrorsCount = 0;

    while (attempts < maxAttempts) {
      const errors = this.logReader.read(currentLogs);
      if (errors.length === 0) {
        break; // Compiled successfully
      }

      attempts++;

      // Pick the first error to resolve
      const targetError = errors[0];
      const errorType = this.classifier.classify(targetError);
      const fixPlan: DebugFixPlan = this.planner.plan(targetError, errorType);

      try {
        const content = await fileLoader(fixPlan.filePath);
        const patch = this.patcher.generate(fixPlan, content);
        await fileSaver(patch.filePath, patch.patchedContent);

        appliedPatches.push(patch);
        fixedErrorsCount++;

        // Trigger new build
        const buildResult = await buildTrigger();
        if (buildResult.success) {
          return {
            success: true,
            attempts,
            fixedErrorsCount,
            unresolvedErrors: [],
            appliedPatches
          };
        }
        currentLogs = buildResult.logs;
      } catch (_e) {
        break; // Exit loop on write/load errors
      }
    }

    const finalErrors = this.logReader.read(currentLogs);
    return {
      success: finalErrors.length === 0,
      attempts,
      fixedErrorsCount,
      unresolvedErrors: finalErrors,
      appliedPatches
    };
  }
}
