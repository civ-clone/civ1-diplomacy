import Criterion from '@civ-clone/core-rule/Criterion';
import Dependencies from '../../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import MayNegotiate from '@civ-clone/library-diplomacy/Rules/Player/MayNegotiate';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';
import { lastNegotiated } from '@civ-clone/library-diplomacy/lib/mayNegotiate';

// How often players meet in v474.05:
// - a computer player and the human, 16 turns after they last met, or 32 after a treaty was signed (OpenCivOne
//  `Segment_2517.cs` L760-790 against `ContactPlayerCountdown`, which signing a treaty sets 16 turns ahead);
// - two computer players at first contact, then about one turn in four while their units are next to each other
//  (`(p1 + p2 + turn) & 3`, L810-819).
export const getRules = (dependencies: Dependencies): MayNegotiate[] => {
  const humanInvolved = (player: Player, other: Player): boolean =>
    isHuman(player, dependencies.clientRegistry) ||
    isHuman(other, dependencies.clientRegistry);

  return [
    new MayNegotiate(
      'civ1-diplomacy:player/may-negotiate/with-the-human',
      new Criterion(humanInvolved),
      new Effect((player: Player, other: Player): boolean => {
        const last = lastNegotiated(
          player,
          other,
          dependencies.interactionRegistry
        );

        if (last === null) {
          return true;
        }

        const treatySince = dependencies.interactionRegistry
          .getByPlayers(player, other)
          .some(
            (interaction) =>
              interaction instanceof Peace && interaction.when() >= last
          );

        return dependencies.turn.value() - last >= (treatySince ? 32 : 16);
      })
    ),
    new MayNegotiate(
      'civ1-diplomacy:player/may-negotiate/computer-players',
      new Criterion(
        (player: Player, other: Player): boolean =>
          !humanInvolved(player, other)
      ),
      new Effect((player: Player, other: Player): boolean => {
        const last = lastNegotiated(
          player,
          other,
          dependencies.interactionRegistry
        );

        return last === null || dependencies.turn.value() - last >= 4;
      })
    ),
  ];
};

export default getRules;
