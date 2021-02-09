import Action from '@civ-clone/core-unit/Action';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Move from '@civ-clone/base-unit-action-move/Move';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import moved from '../Rules/Unit/moved';
import movementCost from '@civ-clone/civ1-unit/Rules/Unit/movementCost';
import validateMove from '@civ-clone/civ1-unit/Rules/Unit/validateMove';

describe('unit:moved', (): void => {
  it('should register a `Contact` when `Unit`s belonging to different `Player`s are on neighbouring `Tile`s', (): void => {
    const ruleRegistry = new RuleRegistry(),
      interactionRegistry = new InteractionRegistry(),
      unitRegistry = new UnitRegistry(),
      world = new World(new FillGenerator(8, 8, Grassland)),
      player = new Player(ruleRegistry),
      enemy = new Player(ruleRegistry);

    ruleRegistry.register(
      ...moved(interactionRegistry, unitRegistry),
      ...movementCost(),
      ...validateMove()
    );

    world.build(ruleRegistry);

    const unit = new Unit(null, player, world.get(0, 0), ruleRegistry),
      enemyUnit = new Unit(null, enemy, world.get(2, 2), ruleRegistry),
      move = new Move(
        enemyUnit.tile(),
        world.get(1, 1),
        enemyUnit,
        ruleRegistry
      );

    unitRegistry.register(unit, enemyUnit);

    expect(interactionRegistry.length).to.equal(0);

    enemyUnit.moves().set(1);

    enemyUnit.action(move as Action);

    expect(interactionRegistry.length).to.equal(1);
  });

  it('should not register a `Contact` when `Unit`s belonging to the same `Player` are on neighbouring `Tile`s', (): void => {
    const ruleRegistry = new RuleRegistry(),
      interactionRegistry = new InteractionRegistry(),
      unitRegistry = new UnitRegistry(),
      world = new World(new FillGenerator(8, 8, Grassland)),
      player = new Player(ruleRegistry);

    ruleRegistry.register(
      ...moved(interactionRegistry, unitRegistry),
      ...movementCost(),
      ...validateMove()
    );

    world.build(ruleRegistry);

    const unit = new Unit(null, player, world.get(0, 0), ruleRegistry),
      otherUnit = new Unit(null, player, world.get(2, 2), ruleRegistry),
      move = new Move(
        otherUnit.tile(),
        world.get(1, 1),
        otherUnit,
        ruleRegistry
      );

    unitRegistry.register(unit, otherUnit);

    expect(interactionRegistry.length).to.equal(0);

    otherUnit.moves().set(1);

    otherUnit.action(move as Action);

    expect(interactionRegistry.length).to.equal(0);
  });
});
