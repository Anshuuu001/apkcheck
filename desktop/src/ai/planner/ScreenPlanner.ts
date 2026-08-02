/**
 * AppForge-AI — Screen Planner V2
 * 
 * Generates screen structures, component trees, layouts, and mappings.
 */

import type { PipelineContext } from '../orchestrator/Context';
import type { ScreenBlueprint } from '../../blueprint/schema';
import { buildScreensFromFeatures } from '../blueprint/screenGenerator';

export class ScreenPlanner {
  async plan(context: PipelineContext): Promise<ScreenBlueprint[]> {
    const intent = context.getIntent();
    const answers = context.getAnswers();
    
    if (!intent || !answers) {
      throw new Error('ScreenPlanner requires intent and requirement answers');
    }

    const allFeatures = [...answers.features];
    if (answers.notificationsRequired) allFeatures.push('notifications');
    if (answers.locationRequired) allFeatures.push('gps_tracking');
    if (answers.paymentRequired && !allFeatures.includes('billing')) {
      allFeatures.push('billing');
    }

    const users = answers.userRoles.length > 0 ? answers.userRoles : intent.targetUsers;
    const screens = buildScreensFromFeatures(allFeatures, users, intent.industry, answers.authRequired);

    // Apply layout engine details for V2 screens
    screens.forEach(screen => {
      if (screen.type === 'dashboard' || screen.type === 'home') {
        screen.layout = 'DashboardLayout';
      } else if (screen.type === 'detail') {
        screen.layout = 'ListDetailLayout';
      } else if (screen.type === 'form') {
        screen.layout = 'FormLayout';
      } else if (screen.type === 'profile') {
        screen.layout = 'ProfileLayout';
      } else {
        screen.layout = 'BaseLayout';
      }
    });

    return screens;
  }
}
