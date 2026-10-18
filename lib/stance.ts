import {
  atPeace,
  atWar,
  cityCount,
  gold,
  landMassesOf,
  mood,
  nukes,
  power,
  presence,
  presenceOn,
  rankedFirst,
  ranking,
  republican,
} from './standing';
import Dependencies from './Dependencies';
import Player from '@civ-clone/core-player/Player';
import { hasVendetta } from '@civ-clone/library-diplomacy/lib/holds';
import isPacified from '@civ-clone/library-diplomacy/lib/isPacified';
import { levelOf } from '@civ-clone/civ1-difficulty/level';

// How a computer player (`player`) comes to a meeting with `other`, as v474.05 works it out when its king meets the
//  human's (OpenCivOne `MeetWithKing.cs` `F6_0000_0000`, L75-660; civ-clone/web-renderer#427):
export interface Stance {
  // Whether the two had a peace treaty as the meeting began.
  atPeace: boolean;
  // How much `player` fears `other`: the attack `other` can bring to bear where `player` has cities and can't hold
  //  them. Above 0 it gives in to demands, offers peace, and may sweeten its offer.
  fear: number;
  // Whether `player` means to threaten `other`: it makes demands and, if they're refused, goes to war.
  hostile: boolean;
  // `hostile` before a wish for peace talked `player` out of it: if it ends up with nothing, it may yet go to war.
  wasHostile: boolean;
  // 0: `player` asks for nothing; 1: it asks politely; 2: it demands.
  mode: 0 | 1 | 2;
  // Whether `player` keeps a peace it means to break (`ShamPeace`): it backs off now, because it's the weaker or
  //  holds a grudge, and drops the treaty later.
  sham: boolean;
  // The gold `player` demands, in fifties, 0 for none.
  tribute: number;
  // `other` leads the world, so every computer player threatens it.
  ultimatum: boolean;
  // A third player, `player`'s enemy, that `other` has a peace treaty with: `player` asks `other` to cancel it.
  enemyAtPeaceWithOther: Player | null;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

// Integer division as the 16-bit original does it: towards zero.
const div = (value: number, by: number): number => Math.trunc(value / by);

// `random` is asked for the one coin v474.05 tosses (whether a computer player that wants peace waives the tribute);
//  without it, nothing random happens and the tribute stands, so the result can be asked for at any time.
// `changeGovernment` is v474.05's other side effect: a hostile Republic or Democracy that can't win its Senate over
//  becomes a Monarchy. It is called only when the meeting itself asks.
export const stance = (
  dependencies: Dependencies,
  player: Player,
  other: Player,
  random: (() => number) | null = null,
  changeGovernment: ((player: Player) => void) | null = null
): Stance => {
  const level = levelOf(dependencies.gameDifficultyRegistry),
    presences = presence(dependencies, player, other),
    ours = presences.get(player)!,
    theirs = presences.get(other)!,
    ourCities = cityCount(dependencies, player),
    ourPower = power(dependencies, player),
    theirPower = power(dependencies, other),
    ourNukes = nukes(dependencies, player),
    theirNukes = nukes(dependencies, other),
    vendetta = hasVendetta(player, other, dependencies.interactionRegistry),
    peace = atPeace(dependencies, player, other);

  let fear = 0,
    tribute = 0,
    hostile = false,
    mode: 0 | 1 | 2 = 1,
    sham = false;

  // 1. Each land mass (L75-231). Where `player` has cities (more than one, if it has more than one in all) and
  //  `other`'s attack there is greater than its defence, it fears for them. Elsewhere, both having units there makes
  //  it hostile, and what it could take from `other` there adds to the tribute.
  landMassesOf(ours, theirs).forEach((landMass) => {
    const us = presenceOn(ours, landMass),
      them = presenceOn(theirs, landMass);

    if (us.cities > (ourCities > 1 ? 1 : 0) && them.attack > us.defence) {
      fear += div(them.attack * (level === 0 ? 4 : 2), us.defence + 1);

      return;
    }

    if (them.defence !== 0 && us.defence !== 0) {
      hostile = true;
    }

    if (them.cities !== 0) {
      tribute += us.cities > 1 ? us.attack - them.attack : us.attack;

      return;
    }

    tribute +=
      us.cities !== 0
        ? div(us.defence - them.attack, 2)
        : div(us.attack - them.attack, 4);
  });

  // 2. An ultimatum to the world's leader (L234-279): late in the game, the highest-ranked civilization with more
  //  than four cities and no nuclear weapons is threatened by every computer player with more than one city. A
  //  grudge does the same, while `player` is a third as strong as `other` or more.
  const ultimatum =
    rankedFirst(dependencies, other) &&
    cityCount(dependencies, other) > 4 &&
    ourCities > 1 &&
    theirNukes === 0 &&
    dependencies.turn.value() > 200;

  if (
    (ultimatum || (vendetta && 3 * ourPower > theirPower)) &&
    theirNukes === 0
  ) {
    hostile = true;
    tribute = clamp(tribute, 10 * ranking(dependencies, player), 9999);
    fear = 0;
  }

  // 3. Nuclear weapons (L282-349).
  if (ourNukes > 0 && theirNukes === 0) {
    hostile = true;
    tribute = clamp(tribute, 100, 9999);
  }

  if (theirNukes > 0) {
    if (ourNukes === 0) {
      fear = 4;
    } else {
      tribute = div(ourNukes * div(tribute, 2), theirNukes);
    }
  }

  if (fear !== 0) {
    hostile = false;
    mode = 0;
  }

  // 4. The Great Wall and the United Nations (L359-376): no threats against their owner. Here, the `Pacified` rules.
  let threatened = ultimatum;

  if (isPacified(player, other, dependencies.ruleRegistry)) {
    threatened = false;
    hostile = false;
  }

  // 5. How much to ask (L386-424): double for a grudge, then scaled by the level, at most $1000, in fifties. It's cut
  //  to what `other` has if that's more than half the ask, and there is no ask at all if `other` couldn't pay.
  if (vendetta) {
    tribute *= 2;
  }

  tribute = clamp(div(tribute * (level + 1), 32), 0, 20) * 50;

  const theirGold = gold(dependencies, other);

  if (tribute > theirGold && tribute <= 2 * theirGold && theirGold >= 50) {
    tribute = div(theirGold, 50) * 50;
  }

  // 6. Nothing to gain, or `other` is more than three times as strong (L465-479).
  if (tribute === 0 || 3 * ourPower < theirPower) {
    hostile = false;
  }

  if (hostile) {
    mode = 2;
  }

  const wasHostile = hostile;

  // 7. A wish for peace (L509-597): a grudge counts against it. Each enemy at least a quarter as strong as `player`
  //  counts for it, a stronger one twice, and so does a Friendly leader; an Aggressive one and being the stronger of
  //  the two count against it.
  let peaceWanted = vendetta ? -2 : 0,
    enemyAtPeaceWithOther: Player | null = null;

  dependencies.playerRegistry
    .entries()
    .filter((third: Player) => third !== player && third !== other)
    .forEach((third: Player) => {
      if (!atWar(dependencies, player, third)) {
        return;
      }

      const theirsToo = power(dependencies, third);

      if (ourPower < 4 * theirsToo) {
        peaceWanted++;
      }

      if (theirsToo > ourPower) {
        peaceWanted++;
      }

      if (atPeace(dependencies, other, third)) {
        enemyAtPeaceWithOther = third;
      }
    });

  peaceWanted -= mood(dependencies, player);

  if (theirPower < ourPower) {
    peaceWanted--;
  }

  if (peaceWanted > (peace ? 0 : 1) && !threatened) {
    hostile = false;

    if (random !== null && random() < 0.5) {
      tribute = 0;
    }
  }

  // 8. Its own Senate (L603-632): a hostile Republic or Democracy without a grudge backs down if `other` is at least
  //  two-thirds as strong; otherwise it gives up its Senate for a Monarchy, and stays hostile.
  if (hostile && !vendetta && republican(dependencies, player)) {
    if (3 * theirPower > 2 * ourPower && !threatened) {
      hostile = false;
    } else if (changeGovernment !== null) {
      changeGovernment(player);
    }
  }

  // 9. Hostile to a treaty partner (L644-660): if `player` is the weaker, or holds a grudge, it keeps the peace for
  //  now, but means to drop it.
  if (peace && hostile && (ourPower < theirPower || vendetta)) {
    hostile = false;
    sham = true;
    mode = 0;
  }

  return {
    atPeace: peace,
    enemyAtPeaceWithOther,
    fear,
    hostile,
    mode,
    sham,
    tribute,
    ultimatum: threatened,
    wasHostile,
  };
};

export default stance;
