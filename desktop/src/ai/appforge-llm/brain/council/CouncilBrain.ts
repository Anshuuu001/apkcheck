import type { AppBlueprint } from '../../../../blueprint/schema';

export interface CouncilReviewResult {
  approved: boolean;
  comments: string[];
}

export abstract class CouncilBrain {
  abstract roleName: string;
  abstract review(blueprint: AppBlueprint): Promise<CouncilReviewResult>;
}
