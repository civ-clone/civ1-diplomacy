import { mood, nukes, republican } from './standing';
import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
import Readers from '@civ-clone/base-diplomacy/lib/Readers';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';
import { levelOf } from '@civ-clone/civ1-difficulty/level';

// What `base-diplomacy` reads about Civilization's content: the human, Nuclear units, Aggressive and Friendly leaders,
//  the Republic's and Democracy's Senate, and the difficulty level.
export const readers = (dependencies: Dependencies): Readers => ({
  isHuman: (player: Player): boolean =>
    isHuman(player, dependencies.clientRegistry),
  nuclear: (player: Player): number => nukes(dependencies, player),
  mood: (player: Player): number => mood(dependencies, player),
  hasSenate: (player: Player): boolean => republican(dependencies, player),
  level: (): number => levelOf(dependencies.gameDifficultyRegistry),
});

export default readers;
