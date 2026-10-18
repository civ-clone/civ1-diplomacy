import Declaration from '@civ-clone/core-diplomacy/Declaration';
import Dependencies from './Dependencies';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';
import War from '@civ-clone/base-diplomacy-declaration-war/War';

const active = (
  dependencies: Dependencies,
  // Not `typeof Declaration`: a subclass with members of its own isn't assignable to it (civ-clone/web-renderer#21).
  DeclarationType: new (...args: any[]) => any,
  ...players: Player[]
): Declaration[] =>
  dependencies.interactionRegistry
    .getByPlayers(...players)
    .filter(
      (interaction): interaction is Declaration =>
        interaction instanceof DeclarationType &&
        (interaction as Declaration).active()
    );

// `player` goes to war with `other`: any treaty between them ends, and so does a peace either meant to drop.
export const declareWar = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): void => {
  active(dependencies, ShamPeace, player, other).forEach((sham) =>
    sham.expire()
  );
  active(dependencies, Peace, player, other).forEach((peace) => peace.expire());

  dependencies.interactionRegistry.register(
    new War(player, other, new Never(), dependencies.ruleRegistry)
  );
};

// `player` and `other` make peace, unless they have already.
export const makePeace = (
  dependencies: Dependencies,
  player: Player,
  other: Player
): void => {
  if (active(dependencies, Peace, player, other).length > 0) {
    return;
  }

  dependencies.interactionRegistry.register(
    new Peace(player, other, new Never(), dependencies.ruleRegistry)
  );
};

export const activeDeclarations = active;

export default declareWar;
