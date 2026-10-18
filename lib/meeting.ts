import { Stance, stance } from './stance';
import Dependencies from './Dependencies';
import { Monarchy } from '@civ-clone/civ1-government/Governments';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';
import { atPeace } from './standing';
import wouldGoToWar from './wouldGoToWar';
import isPacified from '@civ-clone/library-diplomacy/lib/isPacified';
import { republican } from './standing';

// Where a meeting has got to, kept for as long as the negotiation lasts. It isn't saved: a negotiation runs to its
//  end within the turn it starts in.
export interface Meeting {
  // The computer player who came to talk, and the player it came to.
  player: Player;
  other: Player;
  // Two computer players meet without a parley (`wouldGoToWar`): `computer` is what they decide.
  computer: 'war' | 'peace' | 'nothing' | null;
  stance: Stance;
  // Whether this is the first time the two have met.
  firstContact: boolean;
}

const meetings = new WeakMap<Negotiation, Meeting>();

// The computer pair's decision (OpenCivOne `Segment_2517.cs` `F0_2517_0737`, L821-1000): war if either would go to
//  war with the other (neither with the owner of the Great Wall, nor from a Republic or Democracy), otherwise peace.
//  War between two at war already changes nothing.
const computerDecision = (
  dependencies: Dependencies,
  player: Player,
  other: Player,
  firstContact: boolean
): 'war' | 'peace' | 'nothing' => {
  const wants = (a: Player, b: Player): boolean =>
    wouldGoToWar(dependencies, a, b) &&
    !isPacified(a, b, dependencies.ruleRegistry) &&
    !republican(dependencies, a);

  if (wants(player, other) || wants(other, player)) {
    return atPeace(dependencies, player, other) || firstContact
      ? 'war'
      : 'nothing';
  }

  return atPeace(dependencies, player, other) ? 'nothing' : 'peace';
};

// The meeting for `negotiation`, worked out the first time it's asked for: that is when the coin is tossed and a
//  Republic may become a Monarchy.
export const meetingFor = (
  dependencies: Dependencies,
  negotiation: Negotiation,
  random: () => number
): Meeting => {
  const known = meetings.get(negotiation);

  if (known !== undefined) {
    return known;
  }

  const [player, other] = negotiation.players(),
    firstContact = !dependencies.interactionRegistry
      .getByPlayers(player, other)
      .some(
        (interaction) =>
          interaction instanceof Negotiation && interaction !== negotiation
      ),
    computer =
      !isHuman(player, dependencies.clientRegistry) &&
      !isHuman(other, dependencies.clientRegistry),
    meeting: Meeting = {
      player,
      other,
      computer: computer
        ? computerDecision(dependencies, player, other, firstContact)
        : null,
      stance: stance(dependencies, player, other, random, (republic) => {
        try {
          dependencies.playerGovernmentRegistry
            .getByPlayer(republic)
            .set(new Monarchy());
        } catch (e) {
          // A player with no government to change keeps none.
        }
      }),
      firstContact,
    };

  meetings.set(negotiation, meeting);

  return meeting;
};

// The meeting for `negotiation` if it's been worked out, without working it out.
export const knownMeeting = (negotiation: Negotiation): Meeting | null =>
  meetings.get(negotiation) ?? null;

export default meetingFor;
