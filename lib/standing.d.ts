import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
export type { Presence } from '@civ-clone/base-diplomacy/lib/standing';
export {
  atPeace,
  atWar,
  cityCount,
  gold,
  haveMet,
  landMassesOf,
  power,
  presence,
  presenceOn,
  rankedFirst,
} from '@civ-clone/base-diplomacy/lib/standing';
export declare const nukes: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const mood: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const republican: (
  dependencies: Dependencies,
  player: Player
) => boolean;
export declare const ranking: (
  dependencies: Dependencies,
  player: Player
) => number;
