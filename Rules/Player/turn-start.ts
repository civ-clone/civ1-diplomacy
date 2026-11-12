import Dependencies from '../../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import dropShamPeace from '@civ-clone/base-diplomacy/lib/shamPeace';

// A computer player keeping a peace it means to break drops it, without a word, one turn in three (OpenCivOne
//  `Segment_2517.cs` ~L120-135: flag 0x100 becomes 0x200, and its next attack is a sneak attack). The treaty goes
//  first, while the sham still marks it as one to end quietly (`Rules/Declaration/expired`).
export const getRules = (
  dependencies: Dependencies,
  random: () => number
): TurnStart[] => [
  new TurnStart(
    'civ1-diplomacy:player/turn-start/drop-sham-peace',
    new Effect((player: Player): void =>
      dropShamPeace(dependencies, player, random, 1 / 3)
    )
  ),
];

export default getRules;
