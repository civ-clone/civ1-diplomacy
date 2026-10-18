import {
  atPeace,
  atWar,
  landMassesOf,
  mood,
  nukes,
  power,
  presence,
  presenceOn,
} from './standing';
import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
import isHuman from '@civ-clone/civ1-difficulty/isHuman';

const div = (value: number, by: number): number => Math.trunc(value / by);

// Whether computer player `player` would go to war with computer player `other` when they meet: v474.05's test
//  between two computer players (OpenCivOne `Segment_2517.cs` `F0_2517_0b1d`). They don't parley as a computer player
//  and the human do; the game decides it. `player` holds back:
// - while it is at war with a human player and `other` is weaker than that player, or the other way round (it won't
//  weaken a fellow enemy of the human);
// - while `other` has more nuclear weapons;
// - where it has cities that couldn't stand up to `other`'s attack there.
// Otherwise it fights if its attack, where both have units, outweighs `other`'s defence and half its attack there by
//  enough: four times the ratio must reach 4, plus one for each war it already has, one for a treaty it would break,
//  and its leader's Mood taken off. And it fights anyway if it has no cities where they both have units.
export const wouldGoToWar = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): boolean => {
  const humans = dependencies.playerRegistry
    .entries()
    .filter((human: Player) => isHuman(human, dependencies.clientRegistry));

  if (
    humans.some(
      (human: Player) =>
        (atWar(dependencies, player, human) &&
          power(dependencies, other) < power(dependencies, human)) ||
        (atWar(dependencies, other, human) &&
          power(dependencies, player) < power(dependencies, human))
    )
  ) {
    return false;
  }

  if (nukes(dependencies, player) < nukes(dependencies, other)) {
    return false;
  }

  const wars = dependencies.playerRegistry
      .entries()
      .filter(
        (third: Player) => third !== other && atWar(dependencies, player, third)
      ).length,
    reluctance =
      wars +
      (atPeace(dependencies, player, other) ? 1 : 0) -
      mood(dependencies, player),
    presences = presence(dependencies, player, other),
    ours = presences.get(player)!,
    theirs = presences.get(other)!;

  let ourAttack = 0,
    theirStrength = 1,
    citiesContested = 0;

  for (const landMass of landMassesOf(ours, theirs)) {
    const us = presenceOn(ours, landMass),
      them = presenceOn(theirs, landMass);

    if (us.cities !== 0 && div(us.attack, 2) + us.defence < them.attack) {
      return false;
    }

    if (us.attack !== 0 && them.defence !== 0) {
      ourAttack += us.attack;
      theirStrength += div(them.attack, 2) + them.defence;
      citiesContested += us.cities;
    }
  }

  if (div(ourAttack * 4, theirStrength) >= reluctance + 4) {
    return true;
  }

  return citiesContested === 0;
};

export default wouldGoToWar;
