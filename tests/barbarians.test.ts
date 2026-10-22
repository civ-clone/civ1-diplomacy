import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import ClientRegistry from '@civ-clone/core-client/ClientRegistry';
import Contact from '@civ-clone/base-diplomacy-interaction-contact/Contact';
import Effect from '@civ-clone/core-rule/Effect';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/base-terrain-grassland/Grassland';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import { Move } from '@civ-clone/civ1-unit/Actions';
import MovementCost from '@civ-clone/core-unit/Rules/MovementCost';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Unit from '@civ-clone/core-unit/Unit';
import UnitRegistry from '@civ-clone/core-unit/UnitRegistry';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import mayNegotiate from '@civ-clone/library-diplomacy/lib/mayNegotiate';
import mayNegotiateRules from '../Rules/Player/may-negotiate';
import moved from '../Rules/Unit/moved';
import validateMove from '@civ-clone/civ1-unit/Rules/Unit/validateMove';

const barbarianPlayer = (ruleRegistry: RuleRegistry): Player => {
  const player = new Player(ruleRegistry);

  player.setCivilization(new Barbarian());

  return player;
};

describe('the barbarians (civ-clone/web-renderer#169)', (): void => {
  it("can't be negotiated with, whoever asks", (): void => {
    const ruleRegistry = new RuleRegistry(),
      interactionRegistry = new InteractionRegistry(),
      turn = new Turn(),
      dependencies = {
        clientRegistry: new ClientRegistry(),
        interactionRegistry,
        turn,
      };

    ruleRegistry.register(...mayNegotiateRules(dependencies as any));

    const barbarians = barbarianPlayer(ruleRegistry),
      civilization = new Player(ruleRegistry),
      other = new Player(ruleRegistry),
      may = (a: Player, b: Player): boolean =>
        mayNegotiate(a, b, ruleRegistry, interactionRegistry, turn);

    expect(may(civilization, other)).to.be.true;
    expect(may(barbarians, civilization)).to.be.false;
    expect(may(civilization, barbarians)).to.be.false;
  });

  it('make no contact when their units meet another', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      interactionRegistry = new InteractionRegistry(),
      unitRegistry = new UnitRegistry();

    ruleRegistry.register(
      new MovementCost(new Effect(() => 1)),
      ...validateMove(),
      ...moved(interactionRegistry, unitRegistry)
    );

    const world = new World(new FillGenerator(8, 8, Grassland), ruleRegistry);

    await world.build();

    const barbarians = barbarianPlayer(ruleRegistry),
      civilization = new Player(ruleRegistry),
      raider = new Unit(null, barbarians, world.get(1, 1), ruleRegistry),
      settlers = new Unit(null, civilization, world.get(2, 1), ruleRegistry);

    unitRegistry.register(raider, settlers);

    ruleRegistry.process(
      Moved,
      raider,
      new Move(world.get(1, 1), world.get(2, 1), raider, ruleRegistry)
    );
    ruleRegistry.process(
      Moved,
      settlers,
      new Move(world.get(3, 1), world.get(2, 2), settlers, ruleRegistry)
    );

    expect(
      interactionRegistry
        .entries()
        .filter((interaction) => interaction instanceof Contact)
    ).to.have.length(0);
  });
});
