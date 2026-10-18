import Dependencies from '../../lib/Dependencies';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
export declare const getRules: (
  dependencies: Dependencies,
  random: () => number
) => TurnStart[];
export default getRules;
