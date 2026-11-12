import { MeetingStepNumbers } from '@civ-clone/base-diplomacy/lib/meetingSteps';
import Dependencies from '../../lib/Dependencies';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
export declare const stepNumbers: MeetingStepNumbers;
export declare const getRules: (
  dependencies: Dependencies,
  random: () => number
) => Step[];
export default getRules;
