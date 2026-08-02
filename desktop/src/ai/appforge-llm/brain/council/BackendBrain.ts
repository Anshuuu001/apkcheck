import { CouncilBrain, type CouncilReviewResult } from './CouncilBrain';
import type { AppBlueprint } from '../../../../blueprint/schema';

export class BackendBrain extends CouncilBrain {
  roleName = 'Backend';

  async review(blueprint: AppBlueprint): Promise<CouncilReviewResult> {
    const comments: string[] = [];
    const endpoints = blueprint.api.endpoints;

    if (endpoints.length === 0) {
      comments.push('Backend Review: REST endpoints array is empty.');
    } else {
      comments.push(`Backend Review: API setup contains ${endpoints.length} routes.`);
    }

    if (!blueprint.api?.baseUrl) {
      comments.push('Backend Review Error: Base URL path is missing.');
    }

    return {
      approved: !comments.some(c => c.includes('Error')),
      comments
    };
  }
}
