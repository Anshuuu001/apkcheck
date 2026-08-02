import { CouncilBrain, type CouncilReviewResult } from './CouncilBrain';
import type { AppBlueprint } from '../../../../blueprint/schema';
import { BlueprintValidator } from '../../../validator/BlueprintValidator';

export class QABrain extends CouncilBrain {
  roleName = 'QA';
  private validator = new BlueprintValidator();

  async review(blueprint: AppBlueprint): Promise<CouncilReviewResult> {
    const comments: string[] = [];
    const { valid, errors } = this.validator.validate(blueprint);

    if (!valid) {
      errors.forEach(err => comments.push(`QA Review Error: ${err}`));
    } else {
      comments.push('QA Review: Master blueprint passed all structural schema assertions successfully.');
    }

    return {
      approved: valid,
      comments
    };
  }
}
