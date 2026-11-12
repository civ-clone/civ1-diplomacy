import { Stance, StanceNumbers } from '@civ-clone/base-diplomacy/lib/stance';
import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
export type { Stance } from '@civ-clone/base-diplomacy/lib/stance';
export declare const stanceNumbers: StanceNumbers;
export declare const stance: (
  dependencies: Dependencies,
  player: Player,
  other: Player,
  random?: (() => number) | null,
  changeGovernment?: ((player: Player) => void) | null
) => Stance;
export default stance;
