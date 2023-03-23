import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
export declare const getRules: (
  ruleRegistry?: RuleRegistry,
  interactionRegistry?: InteractionRegistry,
  playerResearchRegistry?: PlayerResearchRegistry
) => Step[];
export default getRules;
