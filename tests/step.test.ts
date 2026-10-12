import Criterion from '@civ-clone/core-rule/Criterion';
import DemandTribute from '@civ-clone/library-diplomacy/Proposals/DemandTribute';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import Effect from '@civ-clone/core-rule/Effect';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Pacified from '@civ-clone/library-diplomacy/Rules/Player/Pacified';
import Player from '@civ-clone/core-player/Player';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { expect } from 'chai';
import step from '../Rules/Negotiation/step';

// What `leader` may do once `other` has handed the negotiation over to it, with `leader` pacified towards `other` or
//  not.
const afterHandover = (pacified: boolean): unknown[] => {
  const ruleRegistry = new RuleRegistry(),
    leader = new Player(ruleRegistry),
    other = new Player(ruleRegistry),
    negotiation = new Negotiation(leader, other, ruleRegistry);

  ruleRegistry.register(
    ...step(
      ruleRegistry,
      new InteractionRegistry(),
      new PlayerResearchRegistry()
    )
  );

  if (pacified) {
    ruleRegistry.register(
      new Pacified(
        new Criterion(
          (player: Player, towards: Player): boolean =>
            player === leader && towards === other
        ),
        new Effect((): boolean => true)
      )
    );
  }

  negotiation.proceed(
    new Dialogue(other, 'handover', negotiation, ruleRegistry)
  );

  return negotiation.nextSteps();
};

describe('negotiation:step', (): void => {
  it('should let a leader demand tribute after the handover', (): void => {
    expect(afterHandover(false).some((step) => step instanceof DemandTribute))
      .true;
  });

  it('should not let a leader pacified towards the other demand tribute (civ-clone/web-renderer#30)', (): void => {
    const steps = afterHandover(true);

    expect(steps.some((step) => step instanceof DemandTribute)).false;
    expect(steps.some((step) => step instanceof Dialogue)).true;
  });
});
