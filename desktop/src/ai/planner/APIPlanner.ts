/**
 * AppForge-AI — API Planner V2
 * 
 * Compiles HTTP endpoints, request bodies, query/path parameters, and JSON response models.
 */

import type { PipelineContext } from '../orchestrator/Context';
import type { ApiPlan } from '../../blueprint/schema';
import { buildAPIEndpoints } from '../blueprint/apiGenerator';

export class APIPlanner {
  async plan(context: PipelineContext): Promise<ApiPlan> {
    const answers = context.getAnswers();

    if (!answers) {
      throw new Error('APIPlanner requires answers in context');
    }

    const allFeatures = [...answers.features];
    if (answers.notificationsRequired) allFeatures.push('notifications');
    if (answers.locationRequired) allFeatures.push('gps_tracking');
    if (answers.paymentRequired) allFeatures.push('billing');

    const endpoints = buildAPIEndpoints(allFeatures, answers.authRequired);

    return {
      baseUrl: 'http://localhost:8080/api',
      version: 'v1',
      authScheme: 'jwt',
      endpoints,
    };
  }
}
