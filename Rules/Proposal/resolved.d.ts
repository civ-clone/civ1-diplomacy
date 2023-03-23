import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import Resolved from '@civ-clone/core-diplomacy/Rules/Proposal/Resolved';
export declare const getRules: (
  ruleRegistry?: RuleRegistry,
  interactionRegistry?: InteractionRegistry,
  playerResearchRegistry?: PlayerResearchRegistry
) => Resolved[];
export default getRules;
