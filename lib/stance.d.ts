import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
export interface Stance {
  atPeace: boolean;
  fear: number;
  hostile: boolean;
  wasHostile: boolean;
  mode: 0 | 1 | 2;
  sham: boolean;
  tribute: number;
  ultimatum: boolean;
  enemyAtPeaceWithOther: Player | null;
}
export declare const stance: (
  dependencies: Dependencies,
  player: Player,
  other: Player,
  random?: (() => number) | null,
  changeGovernment?: ((player: Player) => void) | null
) => Stance;
export default stance;
