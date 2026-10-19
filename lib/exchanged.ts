import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Advance from '@civ-clone/core-science/Advance';
import Player from '@civ-clone/core-player/Player';

// What each player took in an accepted exchange of knowledge, kept for the rest of the meeting so the computer player
//  can say what it took (civ-clone/web-renderer#453). Like the meeting itself, it isn't saved: a negotiation runs to
//  its end within the turn it starts in.
const exchanges = new WeakMap<IProposal, Map<Player, typeof Advance>>();

export const recordTaken = (
  proposal: IProposal,
  player: Player,
  advance: typeof Advance
): void => {
  const taken = exchanges.get(proposal) ?? new Map<Player, typeof Advance>();

  taken.set(player, advance);
  exchanges.set(proposal, taken);
};

export const takenBy = (
  proposal: IProposal,
  player: Player
): typeof Advance | null => exchanges.get(proposal)?.get(player) ?? null;
