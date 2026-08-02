import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Square, ToggleLeft, ToggleRight, ChevronRight, ChevronLeft,
  Cpu, Sparkles, Zap, AlertCircle, CheckCircle
} from 'lucide-react';
import { useEngineStore, STAGE_META, ORDERED_STAGES } from '../store/engineStore';
import type { InterviewQuestion } from '../store/engineStore';
import type { RequirementAnswers } from '../blueprint/schema';

// ─── Pipeline Progress Bar ────────────────────────────────────────────────────

const PipelineProgress: React.FC = () => {
  const { currentStage, stageLog } = useEngineStore();

  const displayStages = ORDERED_STAGES.slice(0, 6); // Show first 6 stages

  return (
    <div className="px-6 py-4 bg-slate-950 border-b border-slate-800">
      <div className="flex items-center gap-1 mb-3">
        {displayStages.map((stage, i) => {
          const meta = STAGE_META[stage];
          const stageIndex = ORDERED_STAGES.indexOf(currentStage);
          const thisIndex = ORDERED_STAGES.indexOf(stage);
          const isDone = thisIndex < stageIndex;
          const isActive = stage === currentStage;

          return (
            <React.Fragment key={stage}>
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                isDone ? 'bg-emerald-500/15 text-emerald-400' :
                isActive ? 'bg-violet-500/20 text-violet-300 ring-1 ring-violet-500/40' :
                'bg-slate-900 text-slate-600'
              }`}>
                <span>{meta.icon}</span>
                <span className="hidden sm:block">{meta.name}</span>
              </div>
              {i < displayStages.length - 1 && (
                <div className={`flex-1 h-px ${isDone ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Recent log */}
      {stageLog.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[10px] text-slate-500 truncate">
            {stageLog[stageLog.length - 1]?.message}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Intent Summary Card ──────────────────────────────────────────────────────

const IntentSummary: React.FC = () => {
  const { intentResult } = useEngineStore();
  if (!intentResult) return null;

  return (
    <div className="mx-6 mt-4 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-xs font-bold text-violet-300">AI Detected</span>
        <span className="ml-auto text-[10px] text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded-full">
          {Math.round(intentResult.confidence * 100)}% confidence
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-[10px] text-slate-500 block mb-0.5">Industry</span>
          <span className="text-sm font-bold text-white">{intentResult.industry}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block mb-0.5">App Type</span>
          <span className="text-sm font-bold text-white">{intentResult.appType}</span>
        </div>
        <div className="col-span-2">
          <span className="text-[10px] text-slate-500 block mb-0.5">Detected Users</span>
          <div className="flex flex-wrap gap-1">
            {intentResult.targetUsers.map(u => (
              <span key={u} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{u}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Question Components ──────────────────────────────────────────────────────



const MultiSelectQuestion: React.FC<{
  question: InterviewQuestion;
  selected: string[];
  onChange: (values: string[]) => void;
}> = ({ question, selected, onChange }) => {
  const toggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {(question.options || []).map(option => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            onClick={() => toggle(option.value)}
            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              isSelected
                ? 'bg-violet-500/15 border-violet-500/40 text-white'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-violet-400' : 'text-slate-600'}`}>
              {isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {option.icon && <span className="text-sm">{option.icon}</span>}
                <span className="text-xs font-semibold leading-tight">{option.label}</span>
              </div>
              {option.description && (
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{option.description}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const SingleSelectQuestion: React.FC<{
  question: InterviewQuestion;
  selected: string;
  onChange: (value: string) => void;
}> = ({ question, selected, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      {(question.options || []).map(option => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              isSelected
                ? 'bg-violet-500/15 border-violet-500/40 text-white'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              isSelected ? 'border-violet-500 bg-violet-500' : 'border-slate-600'
            }`}>
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                {option.icon && <span className="text-sm">{option.icon}</span>}
                <span className="text-xs font-semibold">{option.label}</span>
              </div>
              {option.description && (
                <p className="text-[10px] text-slate-500 mt-0.5">{option.description}</p>
              )}
            </div>
            {isSelected && <CheckCircle size={14} className="text-violet-400 flex-shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};

const ToggleQuestion: React.FC<{
  question: InterviewQuestion;
  value: boolean;
  onChange: (v: boolean) => void;
}> = ({ question: _question, value, onChange }) => {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex items-center justify-between w-full p-4 rounded-xl border transition-all cursor-pointer ${
        value
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-lg ${value ? 'text-emerald-400' : 'text-slate-600'}`}>
          {value ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
        </div>
        <span className="text-sm font-semibold">{value ? 'Yes' : 'No'}</span>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
      }`}>
        {value ? 'Enabled' : 'Skip'}
      </span>
    </button>
  );
};

// ─── Main Interview Component ─────────────────────────────────────────────────

interface RequirementInterviewProps {
  onComplete: (answers: RequirementAnswers) => void;
  onCancel?: () => void;
}

export const RequirementInterview: React.FC<RequirementInterviewProps> = ({ onComplete, onCancel }) => {
  const { interviewQuestions, intentResult, isWaitingForAnswers, submitAnswers, currentStage } = useEngineStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect if we are in interview stage
  const isActive = currentStage === 'requirement-interview' && isWaitingForAnswers;
  const questions = interviewQuestions || [];

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
  }, [interviewQuestions]);

  if (!isActive || questions.length === 0) return null;

  const currentQ = questions[currentQuestionIndex];
  const isFirst = currentQuestionIndex === 0;
  const isLast = currentQuestionIndex === questions.length - 1;

  const getAnswer = (field: string): any => answers[field] ?? (
    currentQ?.type === 'toggle' ? false :
    currentQ?.type === 'multi-select' ? [] :
    ''
  );

  const setAnswer = (field: string, value: any) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (!currentQ.required) return true;
    const val = getAnswer(currentQ.field as string);
    if (currentQ.type === 'toggle') return true; // toggles always have a value
    if (currentQ.type === 'multi-select') return Array.isArray(val) && val.length > 0;
    if (currentQ.type === 'single-select') return val !== '';
    return !!val;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (isLast) {
      handleSubmit();
    } else {
      setCurrentQuestionIndex(i => i + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) setCurrentQuestionIndex(i => i - 1);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);

    // Compile answers into RequirementAnswers shape
    const compiled: RequirementAnswers = {
      features: [],
      userRoles: [],
      authRequired: true,
      paymentRequired: false,
      locationRequired: false,
      notificationsRequired: false,
      offlineSupport: false,
      additionalContext: '',
    };

    questions.forEach(q => {
      const val = answers[q.field as string];
      if (val === undefined || val === null) return;

      switch (q.field) {
        case 'authRequired': compiled.authRequired = val; break;
        case 'paymentRequired': compiled.paymentRequired = val; break;
        case 'locationRequired': compiled.locationRequired = val; break;
        case 'notificationsRequired': compiled.notificationsRequired = val; break;
        case 'offlineSupport': compiled.offlineSupport = val; break;
        case 'userRoles':
          compiled.userRoles = Array.isArray(val) ? val : [val];
          break;
        case 'features':
          if (Array.isArray(val)) {
            compiled.features = [...new Set([...compiled.features, ...val])];
          } else if (typeof val === 'string') {
            compiled.features = [...new Set([...compiled.features, val])];
          }
          break;
        default:
          // Unknown field — treat as feature list
          if (typeof val === 'boolean' && val) {
            compiled.features.push(q.field);
          } else if (Array.isArray(val)) {
            compiled.features = [...new Set([...compiled.features, ...val])];
          }
      }
    });

    // Default user roles from intent if not specified
    if (compiled.userRoles.length === 0 && intentResult) {
      compiled.userRoles = intentResult.targetUsers;
    }

    submitAnswers(compiled);
    onComplete(compiled);
  };

  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <PipelineProgress />

        {/* Question area */}
        <div className="flex-1 overflow-y-auto">
          {/* Intent summary */}
          <IntentSummary />

          {/* Progress */}
          <div className="px-6 pt-5 pb-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Cpu size={13} className="text-violet-400" />
                <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">{Math.round(progress)}% complete</span>
            </div>
            <div className="h-1 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="px-6 py-4">
            <h3 className="text-base font-bold text-white mb-1 leading-snug">
              {currentQ.question}
            </h3>
            {currentQ.subtext && (
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{currentQ.subtext}</p>
            )}

            {/* Answer input */}
            {currentQ.type === 'multi-select' && (
              <MultiSelectQuestion
                question={currentQ}
                selected={getAnswer(currentQ.field as string) as string[]}
                onChange={val => setAnswer(currentQ.field as string, val)}
              />
            )}

            {currentQ.type === 'single-select' && (
              <SingleSelectQuestion
                question={currentQ}
                selected={getAnswer(currentQ.field as string) as string}
                onChange={val => setAnswer(currentQ.field as string, val)}
              />
            )}

            {currentQ.type === 'toggle' && (
              <ToggleQuestion
                question={currentQ}
                value={getAnswer(currentQ.field as string) as boolean}
                onChange={val => setAnswer(currentQ.field as string, val)}
              />
            )}

            {currentQ.type === 'text' && (
              <textarea
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"
                rows={3}
                placeholder="Type your answer..."
                value={getAnswer(currentQ.field as string) as string}
                onChange={e => setAnswer(currentQ.field as string, e.target.value)}
              />
            )}

            {/* Validation hint */}
            {currentQ.required && !canProceed() && (
              <div className="flex items-center gap-1.5 mt-3 text-amber-400/80">
                <AlertCircle size={12} />
                <span className="text-[10px]">Please select at least one option to continue</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex items-center gap-3">
          {onCancel && isFirst && (
            <button
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          {!isFirst && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors cursor-pointer"
            >
              <ChevronLeft size={14} />
              Back
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              canProceed() && !isSubmitting
                ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Building...
              </>
            ) : isLast ? (
              <>
                <Zap size={14} />
                Generate Blueprint
              </>
            ) : (
              <>
                Next
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
