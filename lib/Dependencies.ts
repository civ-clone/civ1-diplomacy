import CityRegistry from '@civ-clone/core-city/CityRegistry';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import LandMassRegistry from '@civ-clone/core-world/LandMassRegistry';
import PlayerGovernmentRegistry from '@civ-clone/core-government/PlayerGovernmentRegistry';
import PlayerRegistry from '@civ-clone/core-player/PlayerRegistry';
import PlayerResearchRegistry from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerTreasuryRegistry from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import TraitRegistry from '@civ-clone/core-civilization/TraitRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';

// What the meeting's arithmetic reads: the game's registries, gathered so the rules can pass them on in one go.
export interface Dependencies {
  cityRegistry: CityRegistry;
  clientRegistry: ClientRegistry;
  gameDifficultyRegistry: GameDifficultyRegistry;
  interactionRegistry: InteractionRegistry;
  landMassRegistry: LandMassRegistry;
  playerGovernmentRegistry: PlayerGovernmentRegistry;
  playerRegistry: PlayerRegistry;
  playerResearchRegistry: PlayerResearchRegistry;
  playerTreasuryRegistry: PlayerTreasuryRegistry;
  ruleRegistry: RuleRegistry;
  traitRegistry: TraitRegistry;
  turn: Turn;
  unitRegistry: UnitRegistry;
}

export default Dependencies;
