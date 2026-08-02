/**
 * AppForge-AI — Pipeline V2
 * 
 * Defines pipeline stages, execution signatures, and runners.
 */

import type { PipelineContext } from './Context';
import type { PipelineStage } from '../../blueprint/schema';

export interface PipelineStageRunner {
  stage: PipelineStage;
  run(context: PipelineContext): Promise<void>;
}

export class Pipeline {
  private stages: PipelineStageRunner[] = [];

  registerStage(runner: PipelineStageRunner): void {
    this.stages.push(runner);
  }

  getStages(): PipelineStageRunner[] {
    return this.stages;
  }
}
