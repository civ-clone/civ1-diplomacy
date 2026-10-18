import { IStrength } from '@civ-clone/core-power/Rules/Strength';
import Dependencies from './Dependencies';
import LandMass from '@civ-clone/core-world/LandMass';
import Player from '@civ-clone/core-player/Player';
export interface Presence extends IStrength {
  cities: number;
}
export declare const presence: (
  dependencies: Dependencies,
  ...players: Player[]
) => Map<Player, Map<LandMass, Presence>>;
export declare const landMassesOf: (
  ...presences: Map<LandMass, Presence>[]
) => LandMass[];
export declare const presenceOn: (
  byLandMass: Map<LandMass, Presence>,
  landMass: LandMass
) => Presence;
export declare const power: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const nukes: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const gold: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const cityCount: (
  dependencies: Dependencies,
  player: Player
) => number;
export declare const atPeace: (
  dependencies: Dependencies,
  player: Player,
  other: Player
) => boolean;
export declare const haveMet: (
  dependencies: Dependencies,
  player: Player,
  other: Player
) => boolean;
export declare const atWar: (
  dependencies: Dependencies,
  player: Player,
  other: Player
) => boolean;
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
export declare const rankedFirst: (
  dependencies: Dependencies,
  player: Player
) => boolean;
