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
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

export const getRules: (
  interactionRegistry?: InteractionRegistry,
  unitRegistry?: UnitRegistry
) => Moved[] = (
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): Moved[] => [
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
            .forEach((tileUnit: Unit): void =>
              interactionRegistry.register(new Contact(unit, tileUnit))
            )
        )
    )
  ),
];

export default getRules;
