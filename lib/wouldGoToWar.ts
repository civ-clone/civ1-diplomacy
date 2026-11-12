import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
import { wouldGoToWar as baseWouldGoToWar } from '@civ-clone/base-diplomacy/lib/wouldGoToWar';
import readers from './readers';

// Whether computer player `player` would go to war with computer player `other` when they meet: v474.05's test
//  between two computer players (OpenCivOne `Segment_2517.cs` `F0_2517_0b1d`), four times the ratio of attack to
//  strength reaching 4 plus its reluctance (`base-diplomacy`'s `wouldGoToWar`).
export const wouldGoToWar = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): boolean =>
  baseWouldGoToWar(dependencies, readers(dependencies), 4, player, other);

export default wouldGoToWar;
