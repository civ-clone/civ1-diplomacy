import BaseDependencies from '@civ-clone/base-diplomacy/lib/Dependencies';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';
export interface Dependencies extends BaseDependencies {
  gameDifficultyRegistry: GameDifficultyRegistry;
}
export default Dependencies;
