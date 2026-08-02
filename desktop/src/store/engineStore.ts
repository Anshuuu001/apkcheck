/**
 * AppForge-AI — Engine Pipeline State Store
 * 
 * Tracks which AI engine is currently running, its progress,
 * and the intermediate results from each stage.
 * Used by the UI to show real-time pipeline progress.
 */

import { create } from 'zustand';
import type { PipelineStage, IntentResult, RequirementAnswers } from '../blueprint/schema';

// ─── Stage Metadata ───────────────────────────────────────────────────────────

export const STAGE_META: Record<PipelineStage, { name: string; description: string; icon: string; weight: number }> = {
  idle: {
    name: 'Idle',
    description: 'Waiting for your idea...',
    icon: '💤',
    weight: 0,
  },
  'intent-analysis': {
    name: 'Intent Analyzer',
    description: 'Understanding your app idea and detecting industry...',
    icon: '🧠',
    weight: 10,
  },
  reasoning: {
    name: 'AI Reasoning Engine',
    description: 'Performing domain, competitive, and architectural reasoning...',
    icon: '✨',
    weight: 10,
  },
  'requirement-interview': {
    name: 'Requirement Interview',
    description: 'Asking smart follow-up questions...',
    icon: '💬',
    weight: 5,
  },
  'blueprint-generation': {
    name: 'Blueprint Engine',
    description: 'Generating complete app architecture...',
    icon: '📐',
    weight: 25,
  },
  'component-planning': {
    name: 'Component Planner',
    description: 'Mapping screens to reusable components...',
    icon: '🧩',
    weight: 15,
  },
  'theme-planning': {
    name: 'Theme Engine',
    description: 'Generating design tokens and color palette...',
    icon: '🎨',
    weight: 10,
  },
  'navigation-planning': {
    name: 'Navigation Planner',
    description: 'Designing navigation structure...',
    icon: '🗺️',
    weight: 10,
  },
  'database-planning': {
    name: 'Database Planner',
    description: 'Creating ER diagram and table schemas...',
    icon: '🗄️',
    weight: 10,
  },
  'api-planning': {
    name: 'API Planner',
    description: 'Generating REST endpoints...',
    icon: '🔌',
    weight: 10,
  },
  validation: {
    name: 'Validator',
    description: 'Validating blueprint completeness...',
    icon: '✅',
    weight: 5,
  },
  preview: {
    name: 'Preview Engine',
    description: 'Serving active visual mockup previews...',
    icon: '📱',
    weight: 5,
  },
  'react-native-generation': {
    name: 'React Native Generator',
    description: 'Generating React Native mobile source folders...',
    icon: '⚛️',
    weight: 10,
  },
  'springboot-generation': {
    name: 'Spring Boot Generator',
    description: 'Generating Spring Boot server entities & repository services...',
    icon: '🍃',
    weight: 10,
  },
  testing: {
    name: 'Testing Simulator',
    description: 'Testing navigation schemas on local emulators...',
    icon: '🧪',
    weight: 10,
  },
  'apk-build': {
    name: 'Release APK Build',
    description: 'Building signed release APK container...',
    icon: '🤖',
    weight: 10,
  },
  complete: {
    name: 'Complete',
    description: 'Your app is generated and ready to deploy!',
    icon: '🚀',
    weight: 0,
  },
  error: {
    name: 'Error',
    description: 'An error occurred during processing.',
    icon: '❌',
    weight: 0,
  },
};

// ─── Ordered stages for progress calculation ──────────────────────────────────

export const ORDERED_STAGES: PipelineStage[] = [
  'intent-analysis',
  'reasoning',
  'requirement-interview',
  'blueprint-generation',
  'component-planning',
  'theme-planning',
  'navigation-planning',
  'database-planning',
  'api-planning',
  'validation',
  'preview',
  'react-native-generation',
  'springboot-generation',
  'testing',
  'apk-build',
  'complete',
];

function calculateProgress(stage: PipelineStage): number {
  if (stage === 'idle') return 0;
  if (stage === 'complete') return 100;
  if (stage === 'error') return -1;

  const totalWeight = ORDERED_STAGES.reduce((sum, s) => sum + (STAGE_META[s]?.weight || 0), 0);
  let accumulated = 0;

  for (const s of ORDERED_STAGES) {
    if (s === stage) break;
    accumulated += STAGE_META[s]?.weight || 0;
  }

  return Math.round((accumulated / totalWeight) * 100);
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface EngineStore {
  // Pipeline state
  currentStage: PipelineStage;
  progress: number;
  isRunning: boolean;
  stageLog: { stage: PipelineStage; message: string; timestamp: string }[];
  error: string | null;

  // Intermediate results
  intentResult: IntentResult | null;
  requirementAnswers: RequirementAnswers | null;
  interviewQuestions: InterviewQuestion[] | null;
  isWaitingForAnswers: boolean;

  // Callbacks
  _answerResolver: ((answers: RequirementAnswers) => void) | null;

  // Actions
  setStage: (stage: PipelineStage, message?: string) => void;
  setIntentResult: (result: IntentResult) => void;
  setInterviewQuestions: (questions: InterviewQuestion[]) => void;
  submitAnswers: (answers: RequirementAnswers) => void;
  setError: (error: string) => void;
  reset: () => void;
  addLog: (message: string) => void;

  // Internal
  _waitForAnswers: () => Promise<RequirementAnswers>;
}

// ─── Interview Question Types ─────────────────────────────────────────────────

export type QuestionType = 
  | 'multi-select'   // checkbox list
  | 'single-select'  // radio buttons
  | 'toggle'         // yes/no boolean
  | 'text'           // short text
  | 'role-select';   // user role selection

export interface InterviewQuestion {
  id: string;
  question: string;
  subtext?: string;
  type: QuestionType;
  options?: { label: string; value: string; icon?: string; description?: string }[];
  required: boolean;
  field: keyof RequirementAnswers | string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEngineStore = create<EngineStore>((set, get) => ({
  currentStage: 'idle',
  progress: 0,
  isRunning: false,
  stageLog: [],
  error: null,
  intentResult: null,
  requirementAnswers: null,
  interviewQuestions: null,
  isWaitingForAnswers: false,
  _answerResolver: null,

  setStage: (stage, message) => {
    const meta = STAGE_META[stage];
    const progress = calculateProgress(stage);
    const logEntry = {
      stage,
      message: message || meta.description,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({
      currentStage: stage,
      progress,
      isRunning: stage !== 'idle' && stage !== 'complete' && stage !== 'error',
      stageLog: [...state.stageLog, logEntry],
      error: stage === 'error' ? (message || 'Unknown error') : null,
    }));
  },

  setIntentResult: (result) => {
    set({ intentResult: result });
  },

  setInterviewQuestions: (questions) => {
    set({ interviewQuestions: questions, isWaitingForAnswers: true });
  },

  submitAnswers: (answers) => {
    const resolver = get()._answerResolver;
    if (resolver) {
      resolver(answers);
    }
    set({ requirementAnswers: answers, isWaitingForAnswers: false, _answerResolver: null });
  },

  setError: (error) => {
    set({
      error,
      currentStage: 'error',
      isRunning: false,
      stageLog: [
        ...get().stageLog,
        { stage: 'error', message: error, timestamp: new Date().toISOString() }
      ],
    });
  },

  reset: () => set({
    currentStage: 'idle',
    progress: 0,
    isRunning: false,
    stageLog: [],
    error: null,
    intentResult: null,
    requirementAnswers: null,
    interviewQuestions: null,
    isWaitingForAnswers: false,
    _answerResolver: null,
  }),

  addLog: (message) => {
    const stage = get().currentStage;
    set((state) => ({
      stageLog: [
        ...state.stageLog,
        { stage, message, timestamp: new Date().toISOString() }
      ],
    }));
  },

  _waitForAnswers: () => {
    return new Promise<RequirementAnswers>((resolve) => {
      set({ _answerResolver: resolve });
    });
  },
}));

// ─── Helper Hook ─────────────────────────────────────────────────────────────

/**
 * Returns a human-readable summary of the current pipeline state.
 */
export function useEngineSummary() {
  const { currentStage, progress, isRunning, stageLog, error, intentResult } = useEngineStore();
  const meta = STAGE_META[currentStage];

  return {
    stage: currentStage,
    stageName: meta.name,
    stageIcon: meta.icon,
    stageDescription: meta.description,
    progress,
    isRunning,
    isComplete: currentStage === 'complete',
    hasError: currentStage === 'error',
    error,
    recentLogs: stageLog.slice(-5),
    intentResult,
  };
}
