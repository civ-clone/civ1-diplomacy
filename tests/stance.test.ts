import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Vendetta from '@civ-clone/library-diplomacy/Declarations/Vendetta';
import { expect } from 'chai';
import position from './lib/position';
import stance from '../lib/stance';

// The arithmetic of v474.05's meeting (OpenCivOne `MeetWithKing.cs` `F6_0000_0000`), on hand-built positions. The
//  computer player is the first side; the second is the human. Land masses are numbered from 0.
describe('stance', (): void => {
  it('fears for cities it cannot hold: other attack × 2 / (its defence + 1), × 4 on Chieftain', (): void => {
    [
      [3, 6],
      [0, 13],
    ].forEach(([level, fear]) => {
      const { dependencies, players } = position(
        [
          { cities: [0, 0], units: [{ on: 0, attack: 1, defence: 2 }] },
          { human: true, units: [{ on: 0, attack: 10, defence: 1 }] },
        ],
        { level }
      );

      const result = stance(dependencies, players[0], players[1]);

      expect(result.fear).equal(fear);
      expect(result.hostile).false;
      expect(result.mode).equal(0);
    });
  });

  it('demands what it could take where both stand, scaled by the level, in fifties', (): void => {
    // Land mass 1: the computer player's two cities, attack 20, beside the human's city and its attack 4: 20 − 4 = 16.
    //  King (3): 16 × 4 / 32 = 2, so $100. Both have units there, so it's hostile; it's the stronger, so it demands.
    const { dependencies, players } = position([
      {
        cities: [1, 1],
        units: [{ on: 1, attack: 20, defence: 5 }],
      },
      {
        human: true,
        gold: 500,
        cities: [1],
        units: [{ on: 1, attack: 4, defence: 4 }],
      },
    ]);

    const result = stance(dependencies, players[0], players[1]);

    expect(result.tribute).equal(100);
    expect(result.hostile).true;
    expect(result.mode).equal(2);
  });

  it("cuts the tribute to the other's gold", (): void => {
    const { dependencies, players } = position([
      { cities: [1, 1], units: [{ on: 1, attack: 20, defence: 5 }] },
      {
        human: true,
        gold: 60,
        cities: [1],
        units: [{ on: 1, attack: 4, defence: 4 }],
      },
    ]);

    expect(stance(dependencies, players[0], players[1]).tribute).equal(50);
  });

  it('demands at least ten times its ranking for a grudge, then doubles it', (): void => {
    // Ranked second of two (6), so at least 60 rather than 16; doubled, 120; on King, 120 × 4 / 32 = 15 fifties.
    const { dependencies, interactionRegistry, players, ruleRegistry } =
      position([
        { rank: 0, cities: [1, 1], units: [{ on: 1, attack: 20, defence: 5 }] },
        {
          rank: 10,
          human: true,
          gold: 2000,
          cities: [1],
          units: [{ on: 1, attack: 4, defence: 4 }],
        },
      ]);

    interactionRegistry.register(
      new Vendetta(players[0], players[1], new Never(), ruleRegistry)
    );

    const result = stance(dependencies, players[0], players[1]);

    expect(result.tribute).equal(750);
    expect(result.hostile).true;
  });

  it('is never hostile to a player it is pacified towards (the Great Wall, the United Nations)', (): void => {
    const { dependencies, players } = position(
      [
        { cities: [1, 1], units: [{ on: 1, attack: 20, defence: 5 }] },
        {
          human: true,
          gold: 500,
          cities: [1],
          units: [{ on: 1, attack: 4, defence: 4 }],
        },
      ],
      { pacified: [[0, 1]] }
    );

    expect(stance(dependencies, players[0], players[1]).hostile).false;
  });

  it('backs down from a stronger treaty partner, and means to drop the treaty later', (): void => {
    // Attack 20 and defence 4 against 40: a third as strong or more, but the weaker.
    const { dependencies, interactionRegistry, players, ruleRegistry } =
      position([
        { cities: [1, 1], units: [{ on: 1, attack: 20, defence: 4 }] },
        {
          human: true,
          gold: 500,
          cities: [1],
          units: [{ on: 1, attack: 4, defence: 36 }],
        },
      ]);

    interactionRegistry.register(
      new Peace(players[0], players[1], new Never(), ruleRegistry)
    );

    const result = stance(dependencies, players[0], players[1]);

    expect(result.atPeace).true;
    expect(result.hostile).false;
    expect(result.sham).true;
  });

  it('wants peace with enemies about, and a Friendly leader the more so', (): void => {
    // An enemy (met, no treaty) stronger than it counts twice; a Friendly leader once more: 3 > 1.
    const { dependencies, interactionRegistry, players, ruleRegistry } =
      position([
        {
          mood: -1,
          cities: [1, 1],
          units: [{ on: 1, attack: 20, defence: 5 }],
        },
        {
          human: true,
          gold: 500,
          cities: [1],
          units: [{ on: 1, attack: 4, defence: 4 }],
        },
        { units: [{ on: 2, attack: 30, defence: 30 }] },
      ]);

    // Met: a finished negotiation between them, with no treaty.
    interactionRegistry.register(
      Object.assign(
        Object.create(
          require('@civ-clone/core-diplomacy/Negotiation').default.prototype
        ),
        {
          isBetween: (...between: unknown[]) =>
            between.every(
              (player) => player === players[0] || player === players[2]
            ),
          players: () => [players[0], players[2]],
          id: () => 'negotiation',
        }
      )
    );

    const result = stance(dependencies, players[0], players[1], () => 0.9);

    expect(result.hostile).false;
    expect(result.tribute).equal(100);
    expect(ruleRegistry).not.undefined;
  });
});
