import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { UnitRegistry } from '@civ-clone/core-unit/UnitRegistry';
import Moved from '@civ-clone/core-unit/Rules/Moved';
export declare const getRules: (
  interactionRegistry?: InteractionRegistry,
  unitRegistry?: UnitRegistry
) => Moved[];
export default getRules;
