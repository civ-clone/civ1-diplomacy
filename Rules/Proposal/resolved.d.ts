import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { InteractionRegistry } from '@civ-clone/core-diplomacy/InteractionRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import Advance from '@civ-clone/core-science/Advance';
import Resolved from '@civ-clone/core-diplomacy/Rules/Proposal/Resolved';
declare global {
  interface ChoiceMetaDataMap {
    'diplomacy.exchange-knowledge': typeof Advance;
  }
}
export declare const getRules: (
  ruleRegistry?: RuleRegistry,
  interactionRegistry?: InteractionRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  clientRegistry?: ClientRegistry
) => Resolved[];
export default getRules;
