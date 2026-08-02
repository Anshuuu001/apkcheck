import { CompilerLogReader, type ParsedError } from './CompilerLogReader';
import { ErrorClassifier } from './ErrorClassifier';
import { FixPlanner, type DebugFixPlan } from './FixPlanner';
import { PatchGenerator, type FilePatch } from './PatchGenerator';
import type { LearningDatabase } from '../appforge-llm/learning/learningDb';

export interface DebugReport {
  success: boolean;
  attempts: number;
  fixedErrorsCount: number;
  unresolvedErrors: ParsedError[];
  appliedPatches: FilePatch[];
  usedBuildMemory: boolean;
  usedOpenAI: boolean;
}

/**
 * RetryManager — Step 9: Auto Fix Engine
 *
 * Pipeline:
 *   Build Fails
 *     → CompilerLogReader.read(logs)
 *     → ErrorClassifier.classify(error) → errorSignature
 *     → learningDb.findBuildFix(signature)  ← Build Memory DB
 *     → [Found] PatchGenerator.apply(fix) → RetryManager.retry()
 *     → [Not Found] OpenAI fallback → store fix in DB
 *     → Build Succeeds → learningDb.logBuildError(sig, fix)
 */
export class RetryManager {
  private logReader = new CompilerLogReader();
  private classifier = new ErrorClassifier();
  private planner = new FixPlanner();
  private patcher = new PatchGenerator();
  private db?: LearningDatabase;

  constructor(db?: LearningDatabase) {
    this.db = db;
  }

  /**
   * Main debug cycle with Build Memory integration
   */
  async runDebugCycle(
    initialLogs: string,
    maxAttempts: number = 3,
    fileLoader: (path: string) => Promise<string>,
    fileSaver: (path: string, content: string) => Promise<void>,
    buildTrigger: () => Promise<{ success: boolean; logs: string }>,
    onOpenAIFallback?: (errorDescription: string) => Promise<string | null>
  ): Promise<DebugReport> {
    let currentLogs = initialLogs;
    let attempts = 0;
    const appliedPatches: FilePatch[] = [];
    let fixedErrorsCount = 0;
    let usedBuildMemory = false;
    let usedOpenAI = false;

    while (attempts < maxAttempts) {
      const errors = this.logReader.read(currentLogs);
      if (errors.length === 0) break;

      attempts++;
      const targetError = errors[0];
      const errorType = this.classifier.classify(targetError);

      // ── Step 1: Check Build Memory DB ────────────────────────────────────
      const errorSignature = `${errorType}:${targetError.message?.slice(0, 80) ?? ''}`;
      let knownFix: string | null = null;

      if (this.db) {
        knownFix = this.db.findBuildFix(errorSignature);
        if (knownFix) {
          usedBuildMemory = true;
          console.log(`[AutoFix] 🧠 Build Memory hit: "${errorSignature}" → applying known fix`);
        }
      }

      // ── Step 2: Use known fix or generate new plan ────────────────────────
      let fixPlan: DebugFixPlan;
      if (knownFix) {
        // Build memory provides a pre-built fix description — plan from that
        fixPlan = this.planner.planFromFix(targetError, knownFix);
      } else {
        fixPlan = this.planner.plan(targetError, errorType);
      }

      try {
        const content = await fileLoader(fixPlan.filePath);
        const patch = this.patcher.generate(fixPlan, content);
        await fileSaver(patch.filePath, patch.patchedContent);
        appliedPatches.push(patch);
        fixedErrorsCount++;

        // ── Step 3: Rebuild ───────────────────────────────────────────────
        const buildResult = await buildTrigger();

        if (buildResult.success) {
          // ── Step 4: Store successful fix in Build Memory ──────────────
          if (this.db) {
            this.db.logBuildError(errorSignature, JSON.stringify(fixPlan));
            console.log(`[AutoFix] ✅ Fix stored in Build Memory for future use`);
          }
          return { success: true, attempts, fixedErrorsCount, unresolvedErrors: [], appliedPatches, usedBuildMemory, usedOpenAI };
        }

        currentLogs = buildResult.logs;
      } catch (err) {
        // ── Step 5: OpenAI Fallback for unknown errors ────────────────────
        if (onOpenAIFallback && !knownFix) {
          console.log(`[AutoFix] 🤖 Escalating to OpenAI for unknown error: ${errorType}`);
          const aiFix = await onOpenAIFallback(`Fix this error: ${targetError.message}`);
          if (aiFix && this.db) {
            this.db.logBuildError(errorSignature, aiFix);
            usedOpenAI = true;
            console.log(`[AutoFix] 💾 OpenAI fix stored in Build Memory`);
          }
        }
        break;
      }
    }

    const finalErrors = this.logReader.read(currentLogs);
    return {
      success: finalErrors.length === 0,
      attempts,
      fixedErrorsCount,
      unresolvedErrors: finalErrors,
      appliedPatches,
      usedBuildMemory,
      usedOpenAI,
    };
  }
}
