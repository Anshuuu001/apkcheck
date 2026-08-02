import type { IntentResult } from '../../blueprint/schema';
import type { InterviewQuestion } from '../types/Requirement';
import { BASE_QUESTIONS, INDUSTRY_QUESTIONS } from './IndustryQuestionBank';
import { QuestionGenerator } from './QuestionGenerator';
import { QuestionPriority } from './QuestionPriority';
import { INDUSTRY_ROLES } from '../analyzer/EntityExtractor';

export class InterviewEngine {
  private generator = new QuestionGenerator();
  private priority = new QuestionPriority();

  async getQuestions(intent: IntentResult): Promise<InterviewQuestion[]> {
    let questions: InterviewQuestion[] = [];
    
    // 1. Try LLM dynamic questions first
    const dynamicQuestions = await this.generator.generate(intent);
    if (dynamicQuestions && dynamicQuestions.length > 0) {
      questions = [...dynamicQuestions];
    }

    // 2. Fallback to standard base/industry questions if fields are missing
    const industryQuestions = INDUSTRY_QUESTIONS[intent.industry] || INDUSTRY_QUESTIONS['Custom'];
    
    const hasRolesQuestion = questions.some(q => q.field === 'userRoles');
    if (!hasRolesQuestion) {
      const roles: InterviewQuestion = {
        id: 'roles_general',
        question: 'Which user types will use your app?',
        subtext: 'We detected these roles — select all that apply',
        type: 'multi-select',
        required: true,
        field: 'userRoles',
        options: (INDUSTRY_ROLES[intent.industry] || ['User', 'Admin']).map((role) => ({
          label: role,
          value: role,
          icon: '👤',
        })),
      };
      questions.push(roles);
    }

    const seenFields = new Set(questions.map(q => q.field));
    
    industryQuestions.forEach(q => {
      if (!seenFields.has(q.field)) {
        questions.push(q);
        seenFields.add(q.field);
      }
    });

    BASE_QUESTIONS.forEach(q => {
      if (!seenFields.has(q.field)) {
        questions.push(q);
        seenFields.add(q.field);
      }
    });

    // 3. Sort by priority (critical items first)
    return this.priority.sort(questions);
  }
}
