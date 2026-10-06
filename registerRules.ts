import cityCaptured from './Rules/City/captured';
import declarationExpired from './Rules/Declaration/expired';
import negotiationInteraction from './Rules/Negotiation/interaction';
import negotiationStep from './Rules/Negotiation/step';
import proposalResolved from './Rules/Proposal/resolved';
import unitMoved from './Rules/Unit/moved';
import { Game, defaultGame } from '@civ-clone/core-game';

export const register = (game: Game): void =>
  game.rules.register(
    ...cityCaptured(game.interactions),
    ...declarationExpired(game.engine),
    ...negotiationInteraction(game.interactions),
    ...negotiationStep(game.rules, game.interactions, game.playerResearch),
    ...proposalResolved(
      game.rules,
      game.interactions,
      game.playerResearch,
      game.clients
    ),
    ...unitMoved(game.interactions, game.units)
  );

// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
register(defaultGame);

export default register;
