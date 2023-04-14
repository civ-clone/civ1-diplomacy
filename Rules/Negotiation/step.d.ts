import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
export declare const getRules: (
  ruleRegistry?: RuleRegistry,
  interactionRegistry?: InteractionRegistry,
  playerResearchRegistry?: PlayerResearchRegistry
) => Step[];
export default getRules;
