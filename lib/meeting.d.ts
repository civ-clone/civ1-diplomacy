import { Stance } from './stance';
import Dependencies from './Dependencies';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Player from '@civ-clone/core-player/Player';
export interface Meeting {
  player: Player;
  other: Player;
  computer: 'war' | 'peace' | 'nothing' | null;
  stance: Stance;
  firstContact: boolean;
}
export declare const meetingFor: (
  dependencies: Dependencies,
  negotiation: Negotiation,
  random: () => number
) => Meeting;
export declare const knownMeeting: (negotiation: Negotiation) => Meeting | null;
export default meetingFor;
