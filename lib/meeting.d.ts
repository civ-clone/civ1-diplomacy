import { Meeting } from '@civ-clone/base-diplomacy/lib/meeting';
import Dependencies from './Dependencies';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
export type { Meeting } from '@civ-clone/base-diplomacy/lib/meeting';
export { knownMeeting } from '@civ-clone/base-diplomacy/lib/meeting';
export declare const meetingFor: (
  dependencies: Dependencies,
  negotiation: Negotiation,
  random: () => number
) => Meeting;
export default meetingFor;
