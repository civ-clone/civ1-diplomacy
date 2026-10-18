import { Engine } from '@civ-clone/core-engine/Engine';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import Expired from '@civ-clone/core-diplomacy/Rules/Declaration/Expired';
export declare const getRules: (
  engine?: Engine,
  interactionRegistry?: InteractionRegistry
) => Expired[];
export default getRules;
