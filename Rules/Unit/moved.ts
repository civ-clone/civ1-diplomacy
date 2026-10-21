import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import { Contact } from '../../Interactions';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  interactionRegistry?: InteractionRegistry,
  unitRegistry?: UnitRegistry
) => Moved[] = (
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): Moved[] => {
  // The players each player has a `Contact` with, filled in from the registry the first time a pair is asked about.
  const met = new WeakMap<Player, WeakSet<Player>>(),
    metOf = (player: Player): WeakSet<Player> => {
      if (!met.has(player)) {
        met.set(player, new WeakSet());
      }

      return met.get(player)!;
    },
    // Whether the two have a `Contact` already: one is all "having met" needs (`lib/standing`). A unit moving back and
    //  forth beside another player's added one with every step, and a late game held tens of thousands of them, each
    //  slowing every search of the registry (civ-clone/web-renderer#377).
    inContact = (player: Player, other: Player): boolean => {
      if (metOf(player).has(other)) {
        return true;
      }

      const found = interactionRegistry
        .getByPlayers(player, other)
        .some((interaction): boolean => interaction instanceof Contact);

      if (found) {
        metOf(player).add(other);
        metOf(other).add(player);
      }

      return found;
    };

  return [
    new Moved(
      new Criterion((unit: Unit): boolean =>
        unit
          .tile()
          .getNeighbours()
          .some((tile: Tile): boolean =>
            unitRegistry
              .getByTile(tile)
              .some(
                (tileUnit: Unit): boolean => tileUnit.player() !== unit.player()
              )
          )
      ),
      new Effect((unit: Unit): void =>
        unit
          .tile()
          .getNeighbours()
          .forEach((tile: Tile): void =>
            unitRegistry
              .getByTile(tile)
              .filter(
                (tileUnit: Unit): boolean => tileUnit.player() !== unit.player()
              )
              .forEach((tileUnit: Unit): void => {
                if (inContact(unit.player(), tileUnit.player())) {
                  return;
                }

                interactionRegistry.register(new Contact(unit, tileUnit));
                metOf(unit.player()).add(tileUnit.player());
                metOf(tileUnit.player()).add(unit.player());
              })
          )
      )
    ),
  ];
};

export default getRules;
