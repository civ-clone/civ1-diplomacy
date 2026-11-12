import { Aggressive, Friendly } from '@civ-clone/civ1-civilization/Traits';
import { Democracy, Republic } from '@civ-clone/civ1-government/Governments';
import {
  governedBy,
  rankFromTop,
  traitScore,
  unitCount,
} from '@civ-clone/base-diplomacy/lib/standing';
import Dependencies from './Dependencies';
import { Nuclear } from '@civ-clone/civ1-unit/Units';
import Player from '@civ-clone/core-player/Player';
import Trait from '@civ-clone/core-civilization/Trait';
import Unit from '@civ-clone/core-unit/Unit';

// v474.05 keeps what a player has on each continent (OpenCivOne `AIEngine.cs` L44-81), `base-diplomacy`'s `Presence`.
//  Its fields are named the other way round, `Attack` holding the defence and `Defense` the attack; these hold what
//  they say. A civilization is at war with another when they've met (v474.05's `Contact` flag) and have no peace
//  treaty.
export type { Presence } from '@civ-clone/base-diplomacy/lib/standing';
export {
  atPeace,
  atWar,
  cityCount,
  gold,
  haveMet,
  landMassesOf,
  power,
  presence,
  presenceOn,
  rankedFirst,
} from '@civ-clone/base-diplomacy/lib/standing';

export const nukes = (dependencies: Dependencies, player: Player): number =>
  unitCount(dependencies, player, (unit: Unit) => unit instanceof Nuclear);

// The leader's Mood in v474.05 (`NationDefinition.cs`): 1 Aggressive, −1 Friendly, 0 otherwise.
export const mood = (dependencies: Dependencies, player: Player): number =>
  traitScore(dependencies, player, (trait: Trait) =>
    trait instanceof Aggressive ? 1 : trait instanceof Friendly ? -1 : 0
  );

export const republican = (
  dependencies: Dependencies,
  player: Player
): boolean => governedBy(dependencies, player, Republic, Democracy);

// v474.05's `Ranking`: 7 for the highest score, then down by one, never below 0.
export const ranking = (dependencies: Dependencies, player: Player): number =>
  rankFromTop(dependencies, player, 7);
