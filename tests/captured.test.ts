import AdvanceStolen from '@civ-clone/base-unit-action-steal-technology/AdvanceStolen';
import City from '@civ-clone/core-city/City';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import World from '@civ-clone/core-world/World';
import captured from '../Rules/City/captured';
import { expect } from 'chai';

describe('city:captured', (): void => {
  it('should forget that a city was robbed when it changes hands, and only that city', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      interactionRegistry = new InteractionRegistry(),
      world = new World(new FillGenerator(8, 8, Grassland), ruleRegistry);

    ruleRegistry.register(...captured(interactionRegistry));

    await world.build();

    const thief = new Player(ruleRegistry),
      victim = new Player(ruleRegistry),
      city = new City(victim, world.get(2, 2), '', ruleRegistry),
      other = new City(victim, world.get(5, 5), '', ruleRegistry),
      theft = new AdvanceStolen(thief, victim, city, ruleRegistry),
      otherTheft = new AdvanceStolen(thief, victim, other, ruleRegistry);

    interactionRegistry.register(theft as never, otherTheft as never);

    city.capture(thief);

    expect(interactionRegistry.entries()).to.deep.equal([otherTheft]);
  });
});
