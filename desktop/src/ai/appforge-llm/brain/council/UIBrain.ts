import { CouncilBrain, type CouncilReviewResult } from './CouncilBrain';
import type { AppBlueprint } from '../../../../blueprint/schema';

export class UIBrain extends CouncilBrain {
  roleName = 'UI/UX';

  async review(blueprint: AppBlueprint): Promise<CouncilReviewResult> {
    const comments: string[] = [];
    const screens = blueprint.screens;

    if (screens.length === 0) {
      comments.push('UI/UX Review: Screens array is empty.');
    } else {
      comments.push(`UI/UX Review: Screen mapping contains ${screens.length} layout files.`);
    }

    if (!blueprint.theme?.colors?.primary) {
      comments.push('UI/UX Review Error: Primary design token color is missing.');
    }

    return {
      approved: !comments.some(c => c.includes('Error')),
      comments
    };
  }
}
