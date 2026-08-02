import type { IntentResult } from '../../blueprint/schema';
import type { InterviewQuestion } from '../types/Requirement';

export class InterviewEngine {
  generateQuestions(missingFeatures: string[], industry: string): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];

    // Generate a toggle question for each missing feature
    missingFeatures.forEach(feature => {
      const fieldName = feature.charAt(0).toLowerCase() + feature.slice(1).replace(/\s+/g, '');
      
      // Determine user-friendly title
      let questionText = `Do you need ${feature}?`;
      if (feature === 'Authentication') questionText = 'Do you need User Login & Accounts?';
      else if (feature === 'Billing' || feature === 'Payment') questionText = `Do you need Online Payments & Billing?`;
      
      questions.push({
        id: `q_${fieldName}`,
        question: questionText,
        subtext: `Determined as a standard option for ${industry} apps`,
        type: 'toggle',
        required: false,
        field: fieldName
      });
    });

    // Fallbacks to guarantee questions if missing list is empty
    if (questions.length === 0) {
      questions.push({
        id: 'q_dark_theme',
        question: 'Do you need Dark Theme support?',
        type: 'toggle',
        required: false,
        field: 'darkTheme'
      });
      questions.push({
        id: 'q_notifications',
        question: 'Do you need Push Notifications?',
        type: 'toggle',
        required: false,
        field: 'notificationsRequired'
      });
    }

    return questions;
  }
}
