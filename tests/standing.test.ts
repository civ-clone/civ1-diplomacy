import * as Units from '@civ-clone/civ1-unit/Units';
import { Nuclear } from '@civ-clone/civ1-unit/Units';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';
import { nukes } from '../lib/standing';
import position from './lib/position';

describe('standing', (): void => {
  const UnitTypes = Object.values(Units) as unknown as (typeof Unit)[];

  // `nukes` counted `instanceof Nuclear` before it counted `Detonates`: the same units, for each of the 28 types.
  it('counts the same units as `instanceof Nuclear` did', (): void => {
    expect(UnitTypes).length(28);

    UnitTypes.forEach((UnitType): void => {
      const { dependencies, players } = position([
        { units: [{ on: 0, attack: 1, defence: 1, type: UnitType }] },
      ]);

      expect(nukes(dependencies, players[0]), UnitType.name).equal(
        Object.create(UnitType.prototype) instanceof Nuclear ? 1 : 0
      );
    });
  });

  it('counts every Nuclear unit a player has, and nothing else', (): void => {
    const { dependencies, players } = position([
      {
        units: UnitTypes.map((type) => ({
          on: 0,
          attack: 1,
          defence: 1,
          type,
        })),
      },
      { units: [{ on: 0, attack: 1, defence: 1, nuclear: true }] },
    ]);

    expect(nukes(dependencies, players[0])).equal(1);
    expect(nukes(dependencies, players[1])).equal(1);
  });
});
