import cityCaptured from './Rules/City/captured';
import declarationExpired from './Rules/Declaration/expired';
import negotiationInteraction from './Rules/Negotiation/interaction';
import negotiationStep from './Rules/Negotiation/step';
import playerMayNegotiate from './Rules/Player/may-negotiate';
import playerTurnStart from './Rules/Player/turn-start';
import proposalResolved from './Rules/Proposal/resolved';
import unitDetonated from './Rules/Unit/detonated';
import unitMoved from './Rules/Unit/moved';
import Dependencies from './lib/Dependencies';
import { Game, defaultGame } from '@civ-clone/core-game';

export const dependenciesOf = (game: Game): Dependencies => ({
  cityRegistry: game.cities,
  clientRegistry: game.clients,
  gameDifficultyRegistry: game.difficulty,
  interactionRegistry: game.interactions,
  landMassRegistry: game.landMasses,
  playerGovernmentRegistry: game.playerGovernments,
  playerRegistry: game.players,
  playerResearchRegistry: game.playerResearch,
  playerTreasuryRegistry: game.playerTreasuries,
  ruleRegistry: game.rules,
  traitRegistry: game.traits,
  turn: game.turn,
  unitRegistry: game.units,
});

export const register = (game: Game): void => {
  const dependencies = dependenciesOf(game);

  game.rules.register(
    ...cityCaptured(game.interactions),
    ...declarationExpired(game.engine, game.interactions),
    ...negotiationInteraction(dependencies),
    ...negotiationStep(dependencies, game.rng),
    ...playerMayNegotiate(dependencies),
    ...playerTurnStart(dependencies, game.rng),
    ...proposalResolved(dependencies, game.rng),
    ...unitDetonated(dependencies),
    ...unitMoved(game.interactions, game.units)
  );
};

// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
register(defaultGame);

export default register;
