import Dependencies from '../../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import { activeDeclarations } from '../../lib/declareWar';

// A computer player keeping a peace it means to break drops it, without a word, one turn in three (OpenCivOne
//  `Segment_2517.cs` ~L120-135: flag 0x100 becomes 0x200, and its next attack is a sneak attack).
export const getRules = (
  dependencies: Dependencies,
  random: () => number
): TurnStart[] => [
  new TurnStart(
    'civ1-diplomacy:player/turn-start/drop-sham-peace',
    new Effect((player: Player): void =>
      dependencies.interactionRegistry
        .getByPlayer(player)
        .filter(
          (interaction): interaction is ShamPeace =>
            interaction instanceof ShamPeace &&
            interaction.active() &&
            interaction.holder() === player
        )
        .forEach((sham: ShamPeace): void => {
          const treaties = activeDeclarations(
            dependencies,
            Peace,
            sham.holder(),
            sham.against()
          );

          if (treaties.length > 0 && random() >= 1 / 3) {
            return;
          }

          // The treaty goes first, while the sham still marks it as one to end quietly (`Rules/Declaration/expired`).
          treaties.forEach((peace) => peace.expire(sham.holder()));
          sham.expire(sham.holder());
        })
    )
  ),
];

export default getRules;
