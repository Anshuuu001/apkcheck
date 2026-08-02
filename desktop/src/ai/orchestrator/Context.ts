/**
 * AppForge-AI — Pipeline Context V2
 * 
 * Manages the state passed between orchestrator stages.
 */

import type {
  AppBlueprint, IntentResult, RequirementAnswers,
  ScreenBlueprint, NavigationPlan, DatabasePlan,
  ApiPlan, BusinessFlow, ThemeTokens, AppPermission
} from '../../blueprint/schema';

import { ProjectMemory } from '../memory/ProjectMemory';
import { ConversationMemory } from '../memory/ConversationMemory';
import { History } from '../memory/History';

export interface PipelineContextData {
  projectId: number;
  rawIdea: string;
  intent?: IntentResult;
  answers?: RequirementAnswers;
  theme?: ThemeTokens;
  screens?: ScreenBlueprint[];
  navigation?: NavigationPlan;
  database?: DatabasePlan;
  api?: ApiPlan;
  businessLogic?: BusinessFlow[];
  permissions?: AppPermission[];
  logs: string[];
}

export class PipelineContext {
  private data: PipelineContextData;
  private projectMemory: ProjectMemory;
  private conversationMemory: ConversationMemory;
  private history: History;

  constructor(projectId: number, rawIdea: string) {
    this.data = {
      projectId,
      rawIdea,
      logs: [],
    };
    this.projectMemory = new ProjectMemory();
    this.conversationMemory = new ConversationMemory();
    this.history = new History();
  }

  getProjectMemory(): ProjectMemory {
    return this.projectMemory;
  }

  getConversationMemory(): ConversationMemory {
    return this.conversationMemory;
  }

  getHistory(): History {
    return this.history;
  }

  getProjectId(): number {
    return this.data.projectId;
  }

  getRawIdea(): string {
    return this.data.rawIdea;
  }

  getIntent(): IntentResult | undefined {
    return this.data.intent;
  }

  setIntent(intent: IntentResult): void {
    this.data.intent = intent;
  }

  getAnswers(): RequirementAnswers | undefined {
    return this.data.answers;
  }

  setAnswers(answers: RequirementAnswers): void {
    this.data.answers = answers;
  }

  getTheme(): ThemeTokens | undefined {
    return this.data.theme;
  }

  setTheme(theme: ThemeTokens): void {
    this.data.theme = theme;
  }

  getScreens(): ScreenBlueprint[] | undefined {
    return this.data.screens;
  }

  setScreens(screens: ScreenBlueprint[]): void {
    this.data.screens = screens;
  }

  getNavigation(): NavigationPlan | undefined {
    return this.data.navigation;
  }

  setNavigation(navigation: NavigationPlan): void {
    this.data.navigation = navigation;
  }

  getDatabase(): DatabasePlan | undefined {
    return this.data.database;
  }

  setDatabase(database: DatabasePlan): void {
    this.data.database = database;
  }

  getApi(): ApiPlan | undefined {
    return this.data.api;
  }

  setApi(api: ApiPlan): void {
    this.data.api = api;
  }

  getBusinessLogic(): BusinessFlow[] | undefined {
    return this.data.businessLogic;
  }

  setBusinessLogic(businessLogic: BusinessFlow[]): void {
    this.data.businessLogic = businessLogic;
  }

  getPermissions(): AppPermission[] | undefined {
    return this.data.permissions;
  }

  setPermissions(permissions: AppPermission[]): void {
    this.data.permissions = permissions;
  }

  getLogs(): string[] {
    return this.data.logs;
  }

  addLog(message: string): void {
    this.data.logs.push(`[${new Date().toISOString()}] ${message}`);
  }

  getData(): PipelineContextData {
    return this.data;
  }

  /**
   * Compiles the stored plans into a cohesive AppBlueprint
   */
  compileBlueprint(): AppBlueprint {
    if (!this.data.intent) {
      throw new Error('Cannot compile blueprint: Intent result is missing');
    }

    const { intent, answers, theme, screens, navigation, database, api, businessLogic, permissions } = this.data;

    return {
      id: `proj_${this.data.projectId}_${Date.now()}`,
      version: '1.0.0',
      schemaVersion: '2.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      name: this.data.intent.appType || 'AppForge Project',
      packageName: `com.appforge.${this.data.intent.appType.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app'}`,
      description: this.data.intent.primaryGoal || '',
      industry: this.data.intent.industry,
      appType: this.data.intent.appType,
      users: intent.targetUsers || [],
      authRequired: answers?.authRequired ?? true,
      theme: theme || {
        mode: 'light',
        colors: {
          primary: '#3b82f6', primaryLight: '#60a5fa', primaryDark: '#1d4ed8',
          secondary: '#10b981', secondaryLight: '#34d399', accent: '#f59e0b',
          background: '#f8fafc', surface: '#ffffff', surfaceVariant: '#f1f5f9',
          onPrimary: '#ffffff', onSecondary: '#ffffff', onBackground: '#0f172a',
          onSurface: '#0f172a', error: '#ef4444', success: '#22c55e', warning: '#f59e0b',
          info: '#3b82f6', divider: '#cbd5e1', shadow: 'rgba(0,0,0,0.1)'
        },
        typography: {
          fontFamily: 'System', fontFamilyMono: 'Courier',
          scale: {
            h1: { size: 28, weight: 'bold', lineHeight: 36 },
            h2: { size: 22, weight: 'bold', lineHeight: 28 },
            h3: { size: 18, weight: '600', lineHeight: 24 },
            h4: { size: 16, weight: '600', lineHeight: 22 },
            body1: { size: 15, weight: 'normal', lineHeight: 20 },
            body2: { size: 13, weight: 'normal', lineHeight: 18 },
            caption: { size: 11, weight: 'normal', lineHeight: 14 },
            button: { size: 14, weight: 'bold', lineHeight: 20 },
            overline: { size: 10, weight: '600', lineHeight: 12 }
          }
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
        borderRadius: { none: 0, xs: 2, sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, full: 9999 },
        elevation: { none: 'none', sm: '0px 1px 2px rgba(0,0,0,0.05)', md: '0px 4px 6px rgba(0,0,0,0.05)', lg: '0px 10px 15px rgba(0,0,0,0.05)', xl: '0px 20px 25px rgba(0,0,0,0.05)' },
        iconSet: 'lucide'
      },
      screens: screens || [],
      navigation: navigation || { type: 'stack-only', groups: [] },
      database: database || { dbType: 'mysql', tables: [], relationships: [] },
      api: api || { baseUrl: 'http://localhost:8080/api', version: 'v1', authScheme: 'jwt', endpoints: [] },
      businessLogic: businessLogic || [],
      permissions: permissions || [],
      intentResult: intent,
      requirementAnswers: answers
    };
  }
}
