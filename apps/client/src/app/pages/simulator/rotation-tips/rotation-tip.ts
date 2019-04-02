import { SimulationResult } from '../simulation/simulation-result';
import { RotationTipType } from './rotation-tip-type';
import { CraftingAction } from '../model/actions/crafting-action';
import { Class, Instantiable } from '@kaiu/serializer';
import { ComfortZone } from '../model/actions/buff/comfort-zone';
import { CraftingJob } from '../model/crafting-job.enum';

export abstract class RotationTip {

  public abstract matches(simulationResult: SimulationResult): boolean;

  public abstract canBeAppliedTo(simulationResult: SimulationResult): boolean;

  protected constructor(public readonly type: RotationTipType, public readonly message: string) {
  }

  public messageParams(simulationResult: SimulationResult): any {
    return {};
  }

  protected simulationHasAction(result: SimulationResult, action: Class<CraftingAction>): boolean {
    return result.steps.some(step => step.action.is(action));
  }

  protected crafterHasActions(result: SimulationResult, ...actions: Class<CraftingAction>[]): boolean {
    const simulationState = result.simulation;
    const actionInstances: CraftingAction[] = actions.map(action => new (<Instantiable>action)());
    return actionInstances.reduce((hasActions, action) => {
      const levelRequirement = action.getLevelRequirement();
      if (levelRequirement.job !== CraftingJob.ANY && simulationState.crafterStats.levels[levelRequirement.job] !== undefined) {
        return hasActions && simulationState.crafterStats.levels[levelRequirement.job] >= levelRequirement.level;
      }
      return hasActions && simulationState.crafterStats.level >= levelRequirement.level;
    }, true);
  }

  protected getAllActionIndexes(result: SimulationResult, action: Class<CraftingAction>): number[] {
    return result.simulation.steps.reduce((indexes, step, index) => {
      if (step.action.is(action)) {
        indexes.push(index);
      }
      return indexes;
    }, []);
  }
}
