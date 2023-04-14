import Effect from '@civ-clone/core-rule/Effect';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import { Move } from '@civ-clone/civ1-unit/Actions';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import moved from '../Rules/Unit/moved';
import validateMove from '@civ-clone/civ1-unit/Rules/Unit/validateMove';

describe('unit:moved', (): void => {
  const ruleRegistry = new RuleRegistry(),
    interactionRegistry = new InteractionRegistry(),
    unitRegistry = new UnitRegistry();

  ruleRegistry.register(
    ...moved(interactionRegistry, unitRegistry),
    new MovementCost(new Effect(() => 1)),
    ...validateMove()
  );

  it('should register a `Contact` when `Unit`s belonging to different `Player`s are on neighbouring `Tile`s', async (): Promise<void> => {
    const world = new World(new FillGenerator(8, 8, Grassland), ruleRegistry);

    await world.build();

    const unit = new Unit(
        null,
        new Player(ruleRegistry),
        world.get(0, 0),
        ruleRegistry
      ),
      enemyUnit = new Unit(
        null,
        new Player(ruleRegistry),
        world.get(2, 2),
        ruleRegistry
      ),
      move = new Move(
        enemyUnit.tile(),
        world.get(1, 1),
        enemyUnit,
        ruleRegistry
      );

    unitRegistry.register(unit, enemyUnit);

    expect(interactionRegistry.length).to.equal(0);

    enemyUnit.moves().set(1);

    move.perform();

    expect(
      interactionRegistry.getByPlayers(unit.player(), enemyUnit.player())
    ).length(1);
  });

  it('should not register a `Contact` when `Unit`s belonging to the same `Player` are on neighbouring `Tile`s', async (): Promise<void> => {
    const world = new World(new FillGenerator(8, 8, Grassland), ruleRegistry);

    await world.build();

    const unit = new Unit(
        null,
        new Player(ruleRegistry),
        world.get(0, 0),
        ruleRegistry
      ),
      otherUnit = new Unit(null, unit.player(), world.get(2, 2), ruleRegistry),
      move = new Move(
        otherUnit.tile(),
        world.get(1, 1),
        otherUnit,
        ruleRegistry
      );

    unitRegistry.register(unit, otherUnit);

    expect(
      interactionRegistry.getByPlayers(unit.player(), otherUnit.player())
    ).length(0);

    otherUnit.moves().set(1);

    move.perform();

    expect(
      interactionRegistry.getByPlayers(unit.player(), otherUnit.player())
    ).length(0);
  });
});
