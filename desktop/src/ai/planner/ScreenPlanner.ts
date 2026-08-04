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

      // Generate visual layout coordinates for components (Step 3: UI Planner)
      let currentY = 24;
      const elements = screen.components.map((comp) => {
        let h = 48;
        if (comp.type === 'Heading' || comp.type === 'Text') {
          h = 32;
        } else if (comp.type === 'Card' || comp.type === 'ListItem') {
          h = 80;
        } else if (comp.type === 'Button' || comp.type === 'TextField' || comp.type === 'PasswordField') {
          h = 42;
        } else if (comp.type === 'Calendar' || comp.type === 'MapView') {
          h = 140;
        }

        const element = {
          type: comp.type,
          content: comp.label || comp.props.placeholder || comp.type,
          title: comp.label || comp.type,
          label: comp.label || comp.type,
          x: 12,
          y: currentY,
          w: 270,
          h: h
        };
        currentY += h + 14; // spacing between element boxes
        return element;
      });

      screen.layout_data = JSON.stringify({ elements });
    });

    return screens;
  }
}
