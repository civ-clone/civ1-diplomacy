import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Advance from '@civ-clone/core-science/Advance';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';

// The computer player says which advance it took in an exchange of knowledge (civ-clone/web-renderer#453).
export class AdvanceTaken extends Dialogue {
  private _advance: typeof Advance;

  constructor(
    by: Player,
    advance: typeof Advance,
    negotiation: Negotiation,
    ruleRegistry: RuleRegistry = ruleRegistryInstance
  ) {
    super(by, 'exchange-knowledge.taken', negotiation, ruleRegistry);

    this._advance = advance;

    this.addKey('advance');
  }

  advance(): typeof Advance {
    return this._advance;
  }
}

export default AdvanceTaken;
