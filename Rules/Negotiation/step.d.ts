import Dependencies from '../../lib/Dependencies';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
export declare const getRules: (
  dependencies: Dependencies,
  random: () => number
) => Step[];
export default getRules;
