import { Aggressive, Friendly } from '@civ-clone/civ1-civilization/Traits';
import { Democracy, Republic } from '@civ-clone/civ1-government/Governments';
import { IStrength } from '@civ-clone/core-power/Rules/MilitaryStrength';
import City from '@civ-clone/core-city/City';
import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import Dependencies from './Dependencies';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import LandMass from '@civ-clone/core-world/LandMass';
import { Nuclear } from '@civ-clone/civ1-unit/Units';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import leaderTraits from '@civ-clone/base-leader-personality/lib/leaderTraits';
import { militaryPower } from '@civ-clone/core-power/lib/strength';
import { rankings } from '@civ-clone/core-power/lib/rank';
import { strength } from '@civ-clone/core-power/lib/strength';

// What a player has on one land mass: its cities, and its units' attack and defence (`core-power`'s `MilitaryStrength`).
//  v474.05 keeps the same per continent for each player (OpenCivOne `AIEngine.cs` L44-81). Its fields are named the
//  other way round, `Attack` holding the defence and `Defense` the attack; these hold what they say.
export interface Presence extends IStrength {
  cities: number;
}

const empty = (): Presence => ({ attack: 0, defence: 0, cities: 0 });

// Each land tile's land mass, worked out once per call: `LandMassRegistry#getByTile` searches every land mass.
const landMassesByTile = (dependencies: Dependencies): Map<Tile, LandMass> => {
  const byTile = new Map<Tile, LandMass>();

  dependencies.landMassRegistry
    .entries()
    .forEach((landMass: LandMass) =>
      landMass.tiles().forEach((tile: Tile) => byTile.set(tile, landMass))
    );

  return byTile;
};

// Where `players` stand on each land mass. Units at sea are on no land mass, so they count only in `militaryPower`.
export const presence = (
  dependencies: Dependencies,
  ...players: Player[]
): Map<Player, Map<LandMass, Presence>> => {
  const byTile = landMassesByTile(dependencies),
    result = new Map<Player, Map<LandMass, Presence>>();

  players.forEach((player: Player) => {
    const byLandMass = new Map<LandMass, Presence>(),
      at = (tile: Tile): Presence | null => {
        const landMass = byTile.get(tile);

        if (landMass === undefined) {
          return null;
        }

        if (!byLandMass.has(landMass)) {
          byLandMass.set(landMass, empty());
        }

        return byLandMass.get(landMass)!;
      };

    dependencies.unitRegistry.getByPlayer(player).forEach((unit: Unit) => {
      const here = at(unit.tile());

      if (here === null) {
        return;
      }

      const { attack, defence } = strength(unit, dependencies.ruleRegistry);

      here.attack += attack;
      here.defence += defence;
    });

    dependencies.cityRegistry.getByPlayer(player).forEach((city: City) => {
      const here = at(city.tile());

      if (here !== null) {
        here.cities++;
      }
    });

    result.set(player, byLandMass);
  });

  return result;
};

// The land masses either player stands on.
export const landMassesOf = (
  ...presences: Map<LandMass, Presence>[]
): LandMass[] =>
  Array.from(
    new Set(presences.flatMap((byLandMass) => Array.from(byLandMass.keys())))
  );

export const presenceOn = (
  byLandMass: Map<LandMass, Presence>,
  landMass: LandMass
): Presence => byLandMass.get(landMass) ?? empty();

// v474.05's `MilitaryPower`: every unit's attack and defence, wherever it is.
export const power = (dependencies: Dependencies, player: Player): number =>
  militaryPower(
    dependencies.unitRegistry.getByPlayer(player),
    dependencies.ruleRegistry
  );

export const nukes = (dependencies: Dependencies, player: Player): number =>
  dependencies.unitRegistry
    .getByPlayer(player)
    .filter((unit: Unit) => unit instanceof Nuclear).length;

export const gold = (dependencies: Dependencies, player: Player): number => {
  try {
    return dependencies.playerTreasuryRegistry
      .getByPlayerAndType(player, Gold)
      .value();
  } catch (e) {
    return 0;
  }
};

export const cityCount = (dependencies: Dependencies, player: Player): number =>
  dependencies.cityRegistry.getByPlayer(player).length;

export const atPeace = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): boolean =>
  dependencies.interactionRegistry
    .getByPlayers(player, other)
    .some(
      (interaction) => interaction instanceof Peace && interaction.active()
    );

// Whether the two have met: v474.05's `Contact` flag. Any interaction between them will do, a `Contact` or a
//  negotiation.
export const haveMet = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): boolean =>
  dependencies.interactionRegistry
    .getByPlayers(player, other)
    .some(
      (interaction) =>
        interaction instanceof Contact || interaction instanceof Negotiation
    );

// v474.05 counts a civilization at war with another when they've met and have no peace treaty.
export const atWar = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): boolean =>
  player !== other &&
  haveMet(dependencies, player, other) &&
  !atPeace(dependencies, player, other);

// The leader's Mood in v474.05 (`NationDefinition.cs`): 1 Aggressive, −1 Friendly, 0 otherwise.
export const mood = (dependencies: Dependencies, player: Player): number =>
  leaderTraits(dependencies.traitRegistry, player).reduce(
    (total, trait) =>
      total +
      (trait instanceof Aggressive ? 1 : trait instanceof Friendly ? -1 : 0),
    0
  );

export const republican = (
  dependencies: Dependencies,
  player: Player
): boolean => {
  try {
    return dependencies.playerGovernmentRegistry
      .getByPlayer(player)
      .is(Republic, Democracy);
  } catch (e) {
    return false;
  }
};

// v474.05's `Ranking`: 7 for the highest score, then down by one, never below 0.
export const ranking = (dependencies: Dependencies, player: Player): number =>
  Math.max(
    0,
    7 -
      rankings(
        dependencies.playerRegistry.entries(),
        dependencies.ruleRegistry
      ).indexOf(player)
  );

export const rankedFirst = (
  dependencies: Dependencies,
  player: Player
): boolean =>
  rankings(
    dependencies.playerRegistry.entries(),
    dependencies.ruleRegistry
  )[0] === player;
