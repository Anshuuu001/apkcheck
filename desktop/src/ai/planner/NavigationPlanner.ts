import type { PipelineContext } from '../orchestrator/Context';
import type { NavigationPlan } from '../../blueprint/schema';
import { planNavigation } from './navigationPlanHelper';

export class NavigationPlanner {
  async plan(context: PipelineContext): Promise<NavigationPlan> {
    const intent = context.getIntent();
    const answers = context.getAnswers();
    const screens = context.getScreens();

    if (!intent || !answers || !screens) {
      throw new Error('NavigationPlanner requires intent, answers, and screens in context');
    }

    const allFeatures = [...answers.features];
    if (answers.notificationsRequired) allFeatures.push('notifications');
    if (answers.locationRequired) allFeatures.push('gps_tracking');
    if (answers.paymentRequired) allFeatures.push('billing');

    const users = answers.userRoles.length > 0 ? answers.userRoles : intent.targetUsers;
    return planNavigation(screens, intent.industry, users, allFeatures);
  }
}
