import City from '@civ-clone/core-city/City';
import Dependencies from '../../lib/Dependencies';
import Detonated from '@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Player from '@civ-clone/core-player/Player';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import Vendetta from '@civ-clone/library-diplomacy/Declarations/Vendetta';
import { hasVendetta } from '@civ-clone/library-diplomacy/lib/holds';

// Everyone with a unit or a city under a nuclear strike holds it against the player who launched it (v474.05's
//  Vendetta flag, OpenCivOne `Segment_29f3.cs` ~L1417). Early, while the victims are still there to be found.
export const getRules = (dependencies: Dependencies): Detonated[] => [
  new Detonated(
    'civ1-diplomacy:unit/detonated/vendetta',
    new High(),
    new Effect((unit: Unit, tile: Tile): void => {
      const attacker = unit.player(),
        area = [tile, ...tile.getNeighbours()],
        victims = new Set<Player>([
          ...area.flatMap((areaTile: Tile) =>
            dependencies.unitRegistry
              .getByTile(areaTile)
              .map((victim: Unit) => victim.player())
          ),
          ...area
            .map((areaTile: Tile) =>
              dependencies.cityRegistry.getByTile(areaTile)
            )
            .filter((city: City | null): city is City => city !== null)
            .map((city: City) => city.player()),
        ]);

      victims.delete(attacker);

      victims.forEach((victim: Player) => {
        if (!hasVendetta(victim, attacker, dependencies.interactionRegistry)) {
          dependencies.interactionRegistry.register(
            new Vendetta(
              victim,
              attacker,
              new Never(),
              dependencies.ruleRegistry
            )
          );
        }
      });
    })
  ),
];

export default getRules;
