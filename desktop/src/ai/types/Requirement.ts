import type { QuestionType } from '../../store/engineStore';

export interface Requirement {
  id: string;
  title: string;
  detected: boolean;
  description?: string;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  subtext?: string;
  type: QuestionType;
  options?: { label: string; value: string; icon?: string; description?: string }[];
  required: boolean;
  field: string;
}
