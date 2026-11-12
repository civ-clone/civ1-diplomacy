import BaseDependencies from '@civ-clone/base-diplomacy/lib/Dependencies';
import GameDifficultyRegistry from '@civ-clone/core-difficulty/GameDifficultyRegistry';

// What the meeting's arithmetic reads: the game's registries (`base-diplomacy`'s), and the game's difficulty.
export interface Dependencies extends BaseDependencies {
  gameDifficultyRegistry: GameDifficultyRegistry;
}

export default Dependencies;
