import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Advance from '@civ-clone/core-science/Advance';
import Player from '@civ-clone/core-player/Player';
export declare const recordTaken: (
  proposal: IProposal,
  player: Player,
  advance: typeof Advance
) => void;
export declare const takenBy: (
  proposal: IProposal,
  player: Player
) => typeof Advance | null;
