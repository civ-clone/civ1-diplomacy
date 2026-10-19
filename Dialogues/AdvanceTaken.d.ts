import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Advance from '@civ-clone/core-science/Advance';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
export declare class AdvanceTaken extends Dialogue {
  private _advance;
  constructor(
    by: Player,
    advance: typeof Advance,
    negotiation: Negotiation,
    ruleRegistry?: RuleRegistry
  );
  advance(): typeof Advance;
}
export default AdvanceTaken;
