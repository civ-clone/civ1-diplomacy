import Advance from '@civ-clone/core-science/Advance';
import Dependencies from '../../lib/Dependencies';
import Resolved from '@civ-clone/core-diplomacy/Rules/Proposal/Resolved';
declare global {
  interface ChoiceMetaDataMap {
    'diplomacy.exchange-knowledge': typeof Advance;
  }
}
export declare const getRules: (
  dependencies: Dependencies,
  random: () => number
) => Resolved[];
export default getRules;
