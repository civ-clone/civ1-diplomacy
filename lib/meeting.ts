import {
  Meeting,
  MeetingRules,
  meetingFor as baseMeetingFor,
} from '@civ-clone/base-diplomacy/lib/meeting';
import Dependencies from './Dependencies';
import { Monarchy } from '@civ-clone/civ1-government/Governments';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';
import { republican } from './standing';
import stance from './stance';
import wouldGoToWar from './wouldGoToWar';

export type { Meeting } from '@civ-clone/base-diplomacy/lib/meeting';
export { knownMeeting } from '@civ-clone/base-diplomacy/lib/meeting';

// The computer pair's decision (OpenCivOne `Segment_2517.cs` `F0_2517_0737`, L821-1000): war if either would go to
//  war with the other (neither with the owner of the Great Wall, nor from a Republic or Democracy), otherwise peace.
//  v474.05 swaps an advance each way at every peaceful meeting, treaty or not (`F0_2517_0cef`). A Republic or
//  Democracy that can't win its Senate over becomes a Monarchy.
const rulesFor = (dependencies: Dependencies): MeetingRules => ({
  isHuman: (player: Player): boolean =>
    isHuman(player, dependencies.clientRegistry),
  hasSenate: (player: Player): boolean => republican(dependencies, player),
  wouldGoToWar: (player: Player, other: Player): boolean =>
    wouldGoToWar(dependencies, player, other),
  stance: (player, other, random, changeGovernment) =>
    stance(dependencies, player, other, random, changeGovernment),
  changeGovernment: (republic: Player): void => {
    try {
      dependencies.playerGovernmentRegistry
        .getByPlayer(republic)
        .set(new Monarchy());
    } catch (e) {
      // A player with no government to change keeps none.
    }
  },
});

// Made once for each set of dependencies: a meeting is asked for at every step.
const rulesByDependencies = new WeakMap<Dependencies, MeetingRules>();

const meetingRules = (dependencies: Dependencies): MeetingRules => {
  if (!rulesByDependencies.has(dependencies)) {
    rulesByDependencies.set(dependencies, rulesFor(dependencies));
  }

  return rulesByDependencies.get(dependencies)!;
};

// The meeting for `negotiation`, worked out the first time it's asked for: that is when the coin is tossed and a
//  Republic may become a Monarchy.
export const meetingFor = (
  dependencies: Dependencies,
  negotiation: Negotiation,
  random: () => number
): Meeting =>
  baseMeetingFor(dependencies, meetingRules(dependencies), negotiation, random);

export default meetingFor;
