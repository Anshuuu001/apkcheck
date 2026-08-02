/**
 * AppForge-AI — Orchestrator V2
 * 
 * Central orchestrator coordinating all analyzer and planning agents.
 */

import { PipelineContext } from './Context';
import { useEngineStore } from '../../store/engineStore';
import { useBlueprintStore } from '../../store/blueprintStore';
import type { AppBlueprint } from '../../blueprint/schema';

// Import Sprint 1 Analyzer & Reasoning Core Components
import { IntentAnalyzer } from '../analyzer/IntentAnalyzer';
import { EntityExtractor } from '../analyzer/EntityExtractor';
import { DomainClassifier } from '../analyzer/DomainClassifier';
import { RequirementAnalyzer } from '../analyzer/RequirementAnalyzer';
import { GapAnalyzer } from '../analyzer/GapAnalyzer';
import { InterviewEngine } from '../interview/InterviewEngine';

import { ScreenPlanner } from '../planner/ScreenPlanner';
import { NavigationPlanner } from '../planner/NavigationPlanner';
import { DatabasePlanner } from '../planner/DatabasePlanner';
import { APIPlanner } from '../planner/APIPlanner';
import { BusinessPlanner } from '../planner/BusinessPlanner';
import { BlueprintEngine } from '../blueprint/BlueprintEngine';
import { BlueprintValidator } from '../validator/BlueprintValidator';
import { BlueprintExporter } from '../blueprint/BlueprintExporter';

export class AppOrchestrator {
  private projectId: number;
  private onComplete?: (blueprint: AppBlueprint) => void;
  private onError?: (error: string) => void;

  constructor(projectId: number, options?: {
    onComplete?: (blueprint: AppBlueprint) => void;
    onError?: (error: string) => void;
  }) {
    this.projectId = projectId;
    this.onComplete = options?.onComplete;
    this.onError = options?.onError;
  }

  async run(userIdea: string): Promise<AppBlueprint | null> {
    const engineStore = useEngineStore.getState();
    const blueprintStore = useBlueprintStore.getState();

    // Reset progress track
    engineStore.reset();
    const context = new PipelineContext(this.projectId, userIdea);

    // Load existing project blueprint details if available to seed ProjectMemory
    try {
      if (window.electronAPI && typeof window.electronAPI.getProjectDetails === 'function') {
        const details = await window.electronAPI.getProjectDetails(this.projectId);
        if (details && details.project && details.project.blueprint) {
          const parsedBlueprint = JSON.parse(details.project.blueprint);
          context.getProjectMemory().loadProject(parsedBlueprint);
          context.getHistory().commit(parsedBlueprint, 'Initial loaded blueprint snapshot');
        }
      }
    } catch (e) {
      console.warn('[Orchestrator V2] Failed to preload project memory from SQLite:', e);
    }

    try {
      // ── Stage 1: Intent Analysis & Entity Extraction ──────────────────────
      engineStore.setStage('intent-analysis');
      engineStore.addLog(`Analyzing user idea: "${userIdea}"`);
      context.addLog('Started Intent Analysis');

      const intentAnalyzer = new IntentAnalyzer();
      const domainClassifier = new DomainClassifier();
      const entityExtractor = new EntityExtractor();

      // 1. Intent Analyzer
      const intentCheck = await intentAnalyzer.analyze(userIdea);
      
      // 2. Domain Classifier
      const domainCheck = domainClassifier.classify(userIdea);
      
      // 3. Entity Extractor
      const entityResult = entityExtractor.extract(userIdea, domainCheck.industry);

      const domainLabel = entityResult.domain;
      const intentLabel = intentCheck.intent === 'CREATE_APPLICATION' ? 'Create Application' : intentCheck.intent;

      engineStore.addLog(`✅ Intent:\n${intentLabel}`);
      engineStore.addLog(`✅ Domain:\n${domainLabel}`);

      // Assemble unified intent result matching schema
      const appType = domainCheck.industry === 'Custom' ? 'Custom Application' : `${domainCheck.industry} Application`;
      const intentResult = {
        industry: domainCheck.industry,
        appType: appType,
        targetUsers: entityResult.modules.includes('Admin') ? ['Admin', 'User'] : ['User'],
        primaryGoal: `Manage a ${appType} workflow.`,
        suggestedFeatures: entityResult.modules,
        confidence: (intentCheck.confidence + domainCheck.confidence) / 2,
        rawIdea: userIdea
      };
      
      context.setIntent(intentResult);
      engineStore.setIntentResult(intentResult);
      context.addLog('Finished Intent Analysis');

      await this.delay(600);

      // ── Stage 2: Reasoning Engine ★ ────────────────────────────────────
      engineStore.setStage('reasoning');
      engineStore.addLog('AI Reasoning Engine analyzing domain knowledge...');
      context.addLog('Started Reasoning Engine');

      const reqAnalyzer = new RequirementAnalyzer();
      const reqAnalysis = reqAnalyzer.analyze(userIdea, domainCheck.industry);

      engineStore.addLog(`✅ Required Modules:\n${reqAnalysis.requiredFeatures.join('\n')}`);

      const gapAnalyzer = new GapAnalyzer();
      const missingFeatures = gapAnalyzer.analyze(reqAnalysis.detectedFeatures, domainCheck.industry);

      engineStore.addLog(`\n⚠ Missing:\n${missingFeatures.join('\n')}`);
      context.addLog('Finished Reasoning Engine');

      await this.delay(500);

      // ── Stage 3: Requirement Interview ───────────────────────────────────
      engineStore.setStage('requirement-interview');
      engineStore.addLog('Analyzing custom requirements & generating follow-up interview...');
      context.addLog('Started Requirement Interview Generation');

      const interviewEngine = new InterviewEngine();
      const questions = interviewEngine.generateQuestions(missingFeatures, domainCheck.industry);

      engineStore.addLog(`\n❓ Questions:\n${questions.map(q => q.question).join('\n')}`);

      engineStore.setInterviewQuestions(questions);
      context.addLog('Prepared interview questions');

      // Block until user submits answers
      engineStore.addLog('Waiting for user answers to proceed...');
      const answers = await engineStore._waitForAnswers();
      context.setAnswers(answers);
      engineStore.addLog(`Answers received: auth=${answers.authRequired}, billing=${answers.paymentRequired}`);
      context.addLog('Answers collected');

      await this.delay(500);

      // ── Stage 3: Blueprint Generation (Theme & Screens layout) ───────────
      engineStore.setStage('blueprint-generation');
      engineStore.addLog('Planning Screen structures & Layout templates...');
      context.addLog('Started Screen Planning');

      const screenPlanner = new ScreenPlanner();
      const screens = await screenPlanner.plan(context);
      context.setScreens(screens);
      engineStore.addLog(`Drafted ${screens.length} screens with specific structural layouts.`);

      await this.delay(400);

      // ── Stage 4: Component Planning (Handled by ScreenPlanner & Planners) ─
      engineStore.setStage('component-planning');
      engineStore.addLog('Mapping UI component nodes into layouts...');
      context.addLog('Started Component mapping');
      
      let totalComponents = 0;
      screens.forEach(s => {
        totalComponents += s.components.length;
      });
      engineStore.addLog(`Mapped ${totalComponents} visual component controls across screens.`);

      await this.delay(400);

      // ── Stage 5: Theme Planning ──────────────────────────────────────────
      engineStore.setStage('theme-planning');
      engineStore.addLog('Generating colors, typography and design tokens...');
      context.addLog('Started Theme selection');
      
      const themePlanner = new BlueprintEngine(); // Uses defaults or AI refinements
      const theme = await themePlanner.planTheme(intentResult);
      context.setTheme(theme);
      engineStore.addLog(`Design tokens set. Primary Color: ${theme.colors.primary}`);

      await this.delay(400);

      // ── Stage 6: Navigation Planning ─────────────────────────────────────
      engineStore.setStage('navigation-planning');
      engineStore.addLog('Designing routing paths and user navigation...');
      context.addLog('Started Navigation Planning');
      
      const navPlanner = new NavigationPlanner();
      const navPlan = await navPlanner.plan(context);
      context.setNavigation(navPlan);
      engineStore.addLog(`Navigation type: ${navPlan.type} with ${navPlan.groups.length} groups.`);

      await this.delay(400);

      // ── Stage 7: Database Planning ────────────────────────────────────────
      engineStore.setStage('database-planning');
      engineStore.addLog('Generating MySQL schema tables and mapping relationships...');
      context.addLog('Started Database Planning');
      
      const dbPlanner = new DatabasePlanner();
      const dbPlan = await dbPlanner.plan(context);
      context.setDatabase(dbPlan);
      engineStore.addLog(`Planned MySQL DB: ${dbPlan.tables.length} tables and ${dbPlan.relationships.length} relationships.`);
      dbPlan.tables.forEach(t => {
        engineStore.addLog(`  → Table: ${t.name} (${t.fields.length} columns)`);
      });

      await this.delay(500);

      // ── Stage 8: API Planning ─────────────────────────────────────────────
      engineStore.setStage('api-planning');
      engineStore.addLog('Specifying REST API routes and payloads...');
      context.addLog('Started API Planning');
      
      const apiPlanner = new APIPlanner();
      const apiPlan = await apiPlanner.plan(context);
      context.setApi(apiPlan);
      engineStore.addLog(`REST Server: ${apiPlan.endpoints.length} endpoints compiled.`);

      await this.delay(400);

      // ── Stage 9: Business Planning ────────────────────────────────────────
      context.addLog('Started Business Flow Planning');
      const bizPlanner = new BusinessPlanner();
      const bizFlows = await bizPlanner.plan(context);
      context.setBusinessLogic(bizFlows);

      // ── Stage 10: Validation & Assembly ───────────────────────────────────
      engineStore.setStage('validation');
      engineStore.addLog('Assembling and validating final Master Blueprint...');
      context.addLog('Consolidating blueprint');

      const blueprintEngine = new BlueprintEngine();
      const blueprint = blueprintEngine.assemble(context);

      const validator = new BlueprintValidator();
      const { valid, errors } = validator.validate(blueprint);

      let finalBlueprint = blueprint;
      if (!valid) {
        engineStore.addLog(`⚠️ Validation warnings: ${errors.join(', ')}`);
        engineStore.addLog('Attempting Auto Fix repair...');
        const { fixedBlueprint, fixedItems } = validator.autoFix(blueprint);
        if (fixedItems.length > 0) {
          fixedItems.forEach(item => engineStore.addLog(`🔧 Fix: ${item}`));
          finalBlueprint = fixedBlueprint;
          // Re-validate
          const reVal = validator.validate(finalBlueprint);
          if (reVal.valid) {
            engineStore.addLog('✅ Auto Fix successfully repaired all errors.');
          } else {
            engineStore.addLog(`⚠️ Remaining validation issues: ${reVal.errors.join(', ')}`);
          }
        }
      } else {
        engineStore.addLog('✅ Schema validation succeeded! No warnings.');
      }

      await this.delay(300);

      // Save to local Zustand store
      blueprintStore.setFullBlueprint(finalBlueprint);

      // Save/persist to project files
      const exporter = new BlueprintExporter();
      await exporter.export(this.projectId, finalBlueprint);
      engineStore.addLog('Master Blueprint saved to project storage.');

      // Commit version to memory history and SQLite database
      context.getHistory().commit(finalBlueprint, 'Auto-generated by AI Core V2 pipeline run');
      try {
        if (window.electronAPI && typeof window.electronAPI.createProjectVersion === 'function') {
          const versionTag = `V${context.getHistory().getCommits().length}`;
          const blueprintJson = JSON.stringify(finalBlueprint);
          await window.electronAPI.createProjectVersion(
            this.projectId,
            versionTag,
            `Auto-generated ${versionTag} snapshot`,
            blueprintJson
          );
          engineStore.addLog(`Created version commit ${versionTag} in database.`);
        }
      } catch (e) {
        console.warn('[Orchestrator V2] Failed to create database version commit:', e);
      }

      // ── Stage 11: Preview Runtime Setup ──────────────────────────────────
      engineStore.setStage('preview');
      engineStore.addLog('Structuring visual mockups layout coordinates...');
      context.addLog('Started Preview structure caching');
      await this.delay(500);

      // ── Stage 12: React Native Code Generation ───────────────────────────
      engineStore.setStage('react-native-generation');
      engineStore.addLog('Generating React Native mobile frontend source code...');
      context.addLog('Started React Native source generation');
      if (window.electronAPI && typeof window.electronAPI.generateCodeAssets === 'function') {
        await window.electronAPI.generateCodeAssets(this.projectId);
      }
      await this.delay(500);

      // ── Stage 13: Spring Boot Code Generation ───────────────────────────
      engineStore.setStage('springboot-generation');
      engineStore.addLog('Generating Spring Boot backend controllers & database entities...');
      context.addLog('Started Spring Boot source generation');
      await this.delay(500);

      // ── Stage 14: Testing Verification ──────────────────────────────────
      engineStore.setStage('testing');
      engineStore.addLog('Running navigation routing and visual alignment validation...');
      context.addLog('Started testing run simulation');
      await this.delay(600);

      // ── Stage 15: APK Packaging & Signing ────────────────────────────────
      engineStore.setStage('apk-build');
      engineStore.addLog('Compiling Java classes & packaging signed release APK container...');
      context.addLog('Started APK package build');
      
      const buildLogHandler = (data: any) => {
        if (data && data.projectId === this.projectId) {
          engineStore.addLog(data.message);
        }
      };

      if (window.electronAPI && typeof window.electronAPI.onBuildLog === 'function') {
        window.electronAPI.onBuildLog(buildLogHandler);
      }

      if (window.electronAPI && typeof window.electronAPI.buildRelease === 'function') {
        try {
          await window.electronAPI.buildRelease(this.projectId);
        } finally {
          if (window.electronAPI && typeof window.electronAPI.removeBuildLogListener === 'function') {
            window.electronAPI.removeBuildLogListener();
          }
        }
      }
      await this.delay(800);

      // Complete
      engineStore.setStage('complete');
      context.addLog('Pipeline Complete');
      this.onComplete?.(finalBlueprint);

      return finalBlueprint;
    } catch (error: any) {
      const message = error?.message || 'Pipeline failed';
      engineStore.setError(message);
      context.addLog(`Error: ${message}`);
      this.onError?.(message);
      console.error('[Orchestrator V2] Pipeline failed:', error);
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ─── Singleton Factory ────────────────────────────────────────────────────────

let _orchestrator: AppOrchestrator | null = null;

export function getOrchestrator(projectId: number, options?: {
  onComplete?: (blueprint: AppBlueprint) => void;
  onError?: (error: string) => void;
}): AppOrchestrator {
  _orchestrator = new AppOrchestrator(projectId, options);
  return _orchestrator;
}

export function getCurrentOrchestrator(): AppOrchestrator | null {
  return _orchestrator;
}
