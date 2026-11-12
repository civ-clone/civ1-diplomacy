import {
  MeetingStepNumbers,
  meetingSteps,
} from '@civ-clone/base-diplomacy/lib/meetingSteps';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceTaken from '../../Dialogues/AdvanceTaken';
import Criterion from '@civ-clone/core-rule/Criterion';
import Dependencies from '../../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
import { meetingFor } from '../../lib/meeting';
import { republican } from '../../lib/standing';
import { takenBy } from '../../lib/exchanged';

// v474.05's numbers (OpenCivOne `MeetWithKing.cs`): knowledge is offered while the computer player knows six advances
//  or fewer, or isn't hostile (L664-822); v474.05 marks a demand made by setting the tribute to 999, so a tribute
//  above 50 provokes war at peace (L1036-1453); gold goes in fifties; a refused peace is sweetened with an advance at
//  fear 4, then with 2 × fear − 4 fifties (L1300-1453).
export const stepNumbers: MeetingStepNumbers = {
  openKnowledge: 6,
  provokingTribute: 50,
  goldUnit: 50,
  advanceGiftFear: 4,
  goldGift: (fear: number): number => 2 * fear - 4,
};

// A meeting between a computer player and another, as v474.05 holds one (OpenCivOne `MeetWithKing.cs`
//  `F6_0000_0000`; civ-clone/web-renderer#427). The computer player, the first of the negotiation's players, came to
//  talk. It has one thing to say at each turn, in v474.05's order, and the other player answers:
//
//  1. Its greeting, then knowledge to swap, for as long as both have something new for the other.
//  2. A call to cancel the other's treaty with its enemy; tribute in gold; failing that, an advance.
//  3. Still hostile, war: when it's provoked (at peace, with a demand made), its demand was refused, or at first
//     contact. Otherwise peace: offered, then sweetened when it's refused (an advance, then gold, then everything it
//     has), and war if it's still refused. At peace already, it hands over to the other player, who may demand
//     tribute in turn.
//
// Two computer players don't parley: they meet, and the game decides war or peace (`wouldGoToWar`).
//
// The answers on offer come in the order of `meetingSteps`' rows, the one that costs the answering player nothing first, so
//  a client taking the first takes the safe one (civ-clone/web-renderer#674): receiving the emissary, refusing a
//  demand, an exchange or a call to cancel a treaty, accepting peace, and leaving rather than demanding in turn.
//
// Nothing here changes the meeting: what has been said so far is read from the negotiation, so the steps can be
//  asked for as often as a client likes. The answers' effects are in `Rules/Proposal/resolved`.
export const getRules = (
  dependencies: Dependencies,
  random: () => number
): Step[] =>
  meetingSteps(
    dependencies,
    {
      meeting: (negotiation: Negotiation) =>
        meetingFor(dependencies, negotiation, random),
      hasSenate: (player: Player): boolean => republican(dependencies, player),
      advanceTaken: (
        player: Player,
        advance: typeof Advance,
        negotiation: Negotiation
      ): IAction =>
        new AdvanceTaken(
          player,
          advance,
          negotiation,
          dependencies.ruleRegistry
        ),
      takenBy,
    },
    stepNumbers
  ).map(
    ([applies, next]) =>
      new Step(
        new Criterion(
          (negotiation: Negotiation): boolean =>
            applies(negotiation) && next(negotiation) !== null
        ),
        new Effect((negotiation: Negotiation): IAction => next(negotiation)!)
      )
  );

export default getRules;
