/**
 * AppForge-AI — Business Planner V2
 * 
 * Maps multi-step user flows, transitions, and state/database mutations.
 */

import type { PipelineContext } from '../orchestrator/Context';
import type { BusinessFlow } from '../../blueprint/schema';
import { buildBusinessFlows } from '../blueprint/businessFlowGenerator';

export class BusinessPlanner {
  async plan(context: PipelineContext): Promise<BusinessFlow[]> {
    const intent = context.getIntent();
    const answers = context.getAnswers();

    if (!intent || !answers) {
      throw new Error('BusinessPlanner requires intent and answers in context');
    }

    const allFeatures = [...answers.features];
    if (answers.notificationsRequired) allFeatures.push('notifications');
    if (answers.locationRequired) allFeatures.push('gps_tracking');
    if (answers.paymentRequired) allFeatures.push('billing');

    const users = answers.userRoles.length > 0 ? answers.userRoles : intent.targetUsers;
    return buildBusinessFlows(allFeatures, users, intent.industry);
  }
}
