import Declaration from '@civ-clone/core-diplomacy/Declaration';
import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
export declare const declareWar: (
  dependencies: Dependencies,
  player: Player,
  other: Player
) => void;
export declare const makePeace: (
  dependencies: Dependencies,
  player: Player,
  other: Player
) => void;
export declare const activeDeclarations: (
  dependencies: Dependencies,
  DeclarationType: new (...args: any[]) => any,
  ...players: Player[]
) => Declaration[];
export default declareWar;
