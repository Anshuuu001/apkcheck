import { CouncilBrain, type CouncilReviewResult } from './CouncilBrain';
import type { AppBlueprint } from '../../../../blueprint/schema';

export class CEOBrain extends CouncilBrain {
  roleName = 'CEO';

  async review(blueprint: AppBlueprint): Promise<CouncilReviewResult> {
    const comments: string[] = [];
    const valid = blueprint.name && blueprint.name !== 'AppForge Project';
    
    if (!valid) {
      comments.push('CEO Review: Project name is placeholder, please set specific industry names.');
    } else {
      comments.push(`CEO Review: App name "${blueprint.name}" matches project vision.`);
    }

    return {
      approved: comments.length === 0 || !comments.some(c => c.includes('placeholder')),
      comments
    };
  }
}
