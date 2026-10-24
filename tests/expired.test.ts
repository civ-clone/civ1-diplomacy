import Dependencies from '../lib/Dependencies';
import Engine from '@civ-clone/core-engine/Engine';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import { declareWar } from '../lib/declareWar';
import { expect } from 'chai';
import expired from '../Rules/Declaration/expired';

// Whoever ends a treaty is named when it's announced (civ-clone/web-renderer#641).
describe('declaration/expired/announce', (): void => {
  const setUp = () => {
    const ruleRegistry = new RuleRegistry(),
      interactionRegistry = new InteractionRegistry(),
      emitted: unknown[][] = [],
      engine = {
        emit: (...args: unknown[]) => emitted.push(args),
      } as unknown as Engine,
      a = new Player(ruleRegistry),
      b = new Player(ruleRegistry),
      peace = new Peace(a, b, ruleRegistry);

    ruleRegistry.register(...expired(engine, interactionRegistry));
    interactionRegistry.register(peace);

    return { a, b, emitted, interactionRegistry, peace, ruleRegistry };
  };

  it('should name the player who ended it to both players', (): void => {
    const { a, b, emitted, peace } = setUp();

    peace.expire(a);

    expect(emitted).to.deep.equal([
      ['diplomacy:declaration-expired', peace, a],
      ['player:declaration-expired', a, peace, a],
      ['player:declaration-expired', b, peace, a],
    ]);
  });

  it('should name no one when no one ended it', (): void => {
    const { a, b, emitted, peace } = setUp();

    peace.expire();

    expect(emitted).to.deep.equal([
      ['diplomacy:declaration-expired', peace, null],
      ['player:declaration-expired', a, peace, null],
      ['player:declaration-expired', b, peace, null],
    ]);
  });

  it('should name the player who declares war', (): void => {
    const { b, emitted, interactionRegistry, peace, ruleRegistry } = setUp();

    declareWar(
      { interactionRegistry, ruleRegistry } as unknown as Dependencies,
      b,
      peace.players().find((player) => player !== b)!
    );

    expect(
      emitted
        .filter(([event]) => event === 'player:declaration-expired')
        .map(([, , , by]) => by)
    ).to.deep.equal([b, b]);
  });
});
