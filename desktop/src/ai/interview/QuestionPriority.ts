import type { InterviewQuestion } from '../types/Requirement';

export class QuestionPriority {
  /**
   * Sorts questions so that critical inputs (roles, features, auth) appear first.
   */
  sort(questions: InterviewQuestion[]): InterviewQuestion[] {
    return [...questions].sort((a, b) => {
      // 1. Prioritize required questions
      if (a.required && !b.required) return -1;
      if (!a.required && b.required) return 1;

      // 2. Prioritize key scoping fields
      const aWeight = this.getFieldWeight(a.field);
      const bWeight = this.getFieldWeight(b.field);
      return bWeight - aWeight;
    });
  }

  private getFieldWeight(field: string): number {
    switch (field) {
      case 'userRoles': return 100;
      case 'features': return 90;
      case 'authRequired': return 80;
      case 'paymentRequired': return 70;
      case 'locationRequired': return 60;
      case 'notificationsRequired': return 50;
      default: return 10;
    }
  }
}
