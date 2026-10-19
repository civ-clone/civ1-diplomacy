import { Alphabet, Bronze, Wheel, Writing, position } from './lib/position';
import AdvanceTaken from '../Dialogues/AdvanceTaken';
import ExchangeKnowledge from '@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Decline from '@civ-clone/core-diplomacy/Proposal/Decline';
import DemandTribute from '@civ-clone/library-diplomacy/Proposals/DemandTribute';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import OfferPeace from '@civ-clone/library-diplomacy/Proposals/OfferPeace';
import OfferPeaceWithGift from '@civ-clone/library-diplomacy/Proposals/OfferPeaceWithGift';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import Resolution from '@civ-clone/core-diplomacy/Proposal/Resolution';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';
import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';
import War from '@civ-clone/base-diplomacy-declaration-war/War';
import { expect } from 'chai';
import interaction from '../Rules/Negotiation/interaction';
import resolved from '../Rules/Proposal/resolved';
import step from '../Rules/Negotiation/step';

type Setup = ReturnType<typeof position>;

// Runs a meeting the way the clients do: the player whose steps are on offer picks the next, or, when they're more than
//  one player's, whoever the last step was for (civ-clone/web-renderer#450: after the hand-over, the human's OK is for
//  the computer player, but the next move is the human's). The computer player takes the only step it's offered
//  (accepting where it may choose); the human's `choose` picks from what it's offered.
const meet = async (
  setup: Setup,
  choose: (steps: IAction[]) => IAction,
  random: () => number = () => 0.9
): Promise<{ log: string[]; negotiation: Negotiation }> => {
  const { dependencies, players, ruleRegistry } = setup,
    [computer, human] = players,
    log: string[] = [];

  ruleRegistry.register(
    ...step(dependencies, random),
    ...resolved(dependencies, random),
    ...interaction(dependencies)
  );

  const negotiation = new Negotiation(computer, human, ruleRegistry);

  for (let i = 0; i < 40 && !negotiation.terminated(); i++) {
    const steps = negotiation.nextSteps(),
      last = negotiation.lastInteraction(),
      actors = Array.from(new Set(steps.map((step) => step.by()))),
      next =
        actors.length === 1
          ? actors[0]
          : last === null
          ? computer
          : last.for()[0],
      chosen =
        next === human &&
        setup.dependencies.clientRegistry.getBy('player', human)[0].constructor
          .name === 'Object'
          ? choose(steps)
          : steps.find((action) => action instanceof Accept) ?? steps[0];

    log.push(
      chosen instanceof Dialogue
        ? `${chosen.constructor.name}:${chosen.key()}`
        : chosen.constructor.name
    );

    negotiation.proceed(chosen);

    if (chosen instanceof Resolution) {
      await chosen.proposal().resolve(chosen);
    }
  }

  return { log, negotiation };
};

const pick =
  (...wanted: (new (...args: any[]) => IAction)[]) =>
  (steps: IAction[]): IAction =>
    steps.find((action) => wanted.some((Wanted) => action instanceof Wanted)) ??
    steps[0];

// Receives the emissary, then turns everything down.
const refuseAll = (steps: IAction[]): IAction =>
  steps.find(
    (action) =>
      action instanceof Accept &&
      (action as Resolution).proposal().constructor.name === 'Initiate'
  ) ??
  steps.find((action) => action instanceof Decline) ??
  steps[0];

const active = (
  setup: Setup,
  Type: new (...args: any[]) => any,
  a: Player,
  b: Player
) =>
  setup.interactionRegistry
    .getByPlayers(a, b)
    .filter(
      (interaction) =>
        interaction instanceof Type && (interaction as any).active()
    );

// A computer player much stronger than the human on the land they share (see `stance.test`): it demands $100.
const bully = (humanGold = 500) =>
  position([
    { cities: [1, 1], units: [{ on: 1, attack: 20, defence: 5 }] },
    {
      human: true,
      gold: humanGold,
      cities: [1],
      units: [{ on: 1, attack: 4, defence: 4 }],
    },
  ]);

describe('meeting', (): void => {
  it('demands tribute, and declares war when it is refused', async (): Promise<void> => {
    const setup = bully(),
      { log } = await meet(setup, pick(Accept));

    expect(log.slice(0, 4)).eql([
      'Initiate',
      'Accept',
      'Dialogue:welcome.no-peace',
      'Acknowledge',
    ]);
    expect(log[4]).equal('DemandTribute');

    const refused = bully(),
      result = await meet(refused, refuseAll);

    expect(result.log).include('Dialogue:declare-war.rejected');
    expect(
      active(refused, War, ...(refused.players as [Player, Player]))
    ).length(1);
  });

  it('takes the tribute and leaves in peace when it is paid', async (): Promise<void> => {
    const setup = bully();

    setup.interactionRegistry.register(
      new Peace(
        setup.players[0],
        setup.players[1],
        new Never(),
        setup.ruleRegistry
      )
    );

    // At peace and much the stronger: it demands, and is paid.
    const { log } = await meet(setup, pick(Accept, Terminate));

    expect(log).include('DemandTribute');
    expect(setup.gold.get(setup.players[1])).equal(400);
    expect(setup.gold.get(setup.players[0])).equal(100);
    expect(log).include('Dialogue:handover');
    expect(log).not.include('Dialogue:declare-war.provoked');
    expect(active(setup, Peace, setup.players[0], setup.players[1])).length(1);
  });

  it('sweetens a refused peace offer (an advance, then gold), then mobilizes', async (): Promise<void> => {
    // Afraid (fear 6: attack 9 × 2 / (defence 2 + 1)) and at war: it offers peace.
    const setup = position([
        {
          gold: 200,
          advances: [Bronze],
          cities: [0, 0],
          units: [{ on: 0, attack: 1, defence: 2 }],
        },
        {
          human: true,
          advances: [Wheel],
          units: [{ on: 0, attack: 9, defence: 1 }],
        },
      ]),
      { log } = await meet(setup, refuseAll);

    expect(
      log.filter(
        (entry) => entry === 'OfferPeace' || entry === 'OfferPeaceWithGift'
      )
    ).eql(['OfferPeace', 'OfferPeaceWithGift', 'OfferPeaceWithGift']);
    expect(log).include('Dialogue:declare-war.mobilize');
  });

  it('hands over the sweetener when the offer is accepted', async (): Promise<void> => {
    const setup = position([
      {
        gold: 200,
        advances: [Bronze],
        cities: [0, 0],
        units: [{ on: 0, attack: 1, defence: 2 }],
      },
      {
        human: true,
        advances: [Wheel],
        units: [{ on: 0, attack: 9, defence: 1 }],
      },
    ]);
    let offers = 0;

    await meet(setup, (steps) => {
      const decline = steps.find((action) => action instanceof Decline),
        accept = steps.find((action) => action instanceof Accept);

      if (accept && (accept as Resolution).proposal() instanceof OfferPeace) {
        offers++;

        // Turn down the plain offer; take the advance.
        return offers === 2 ? accept : decline!;
      }

      return accept ?? steps[0];
    });

    expect(setup.advances.get(setup.players[1])).include(Bronze);
    expect(active(setup, Peace, setup.players[0], setup.players[1])).length(1);
  });

  it('pays the human what it fears to refuse, after the handover', async (): Promise<void> => {
    // At peace and afraid (fear 2), with $200: it pays $100.
    const setup = position([
      { gold: 200, cities: [0, 0], units: [{ on: 0, attack: 1, defence: 2 }] },
      { human: true, units: [{ on: 0, attack: 4, defence: 1 }] },
    ]);

    setup.interactionRegistry.register(
      new Peace(
        setup.players[0],
        setup.players[1],
        new Never(),
        setup.ruleRegistry
      )
    );

    // The human, not the computer player, is offered the demand and the goodbye after the hand-over.
    const offered: string[][] = [],
      { log } = await meet(setup, (steps: IAction[]): IAction => {
        offered.push(steps.map((step) => step.constructor.name));

        return pick(DemandTribute, Accept)(steps);
      });

    expect(log).include('Dialogue:handover');
    expect(offered).deep.include(['DemandTribute', 'Terminate']);
    expect(log.filter((entry) => entry === 'DemandTribute')).length(1);
    expect(setup.gold.get(setup.players[1])).equal(100);
  });

  it('offers what it knows for what the other knows, and says what it took (#453)', async (): Promise<void> => {
    const setup = position([
        { advances: [Bronze, Wheel], cities: [0] },
        { human: true, advances: [Alphabet, Writing], cities: [0] },
      ]),
      [computer, human] = setup.players,
      { negotiation } = await meet(setup, pick(Accept));

    const offers = negotiation
        .interactions()
        .filter(
          (action): action is ExchangeKnowledge =>
            action instanceof ExchangeKnowledge
        ),
      taken = negotiation
        .interactions()
        .filter(
          (action): action is AdvanceTaken => action instanceof AdvanceTaken
        );

    expect(offers.length).greaterThan(0);
    // The offer names what the computer player knows and the human doesn't.
    expect(offers[0].advances().map((advance) => advance.sourceClass())).eql([
      Bronze,
      Wheel,
    ]);
    // Each takes the first it's offered from the other's list, and the computer player says what it took.
    expect(setup.advances.get(human)).include(Bronze);
    expect(setup.advances.get(computer)).include(Alphabet);
    expect(taken.length).equal(offers.length);
    expect(taken[0].by()).equal(computer);
    expect(taken[0].advance()).equal(Alphabet);
  });

  it('takes the reply to "You respond..." as its answer, with no OK first (#454)', async (): Promise<void> => {
    const setup = position([
      { gold: 200, cities: [0, 0], units: [{ on: 0, attack: 1, defence: 2 }] },
      { human: true, units: [{ on: 0, attack: 4, defence: 1 }] },
    ]);

    setup.interactionRegistry.register(
      new Peace(
        setup.players[0],
        setup.players[1],
        new Never(),
        setup.ruleRegistry
      )
    );

    const { log } = await meet(setup, pick(Terminate));

    expect(log.slice(log.indexOf('Dialogue:handover') + 1)).eql(['Terminate']);
  });

  it('keeps a peace it means to drop, as a sham', async (): Promise<void> => {
    const setup = position([
      { cities: [1, 1], units: [{ on: 1, attack: 20, defence: 5 }] },
      {
        human: true,
        gold: 500,
        cities: [1],
        units: [{ on: 1, attack: 4, defence: 40 }],
      },
    ]);

    setup.interactionRegistry.register(
      new Peace(
        setup.players[0],
        setup.players[1],
        new Never(),
        setup.ruleRegistry
      )
    );

    await meet(setup, pick(Terminate));

    expect(active(setup, ShamPeace, setup.players[0], setup.players[1])).length(
      1
    );
  });

  it('lets two computer players settle it between them', async (): Promise<void> => {
    // Neither can take on the other where both are: peace.
    const setup = position([
        {
          advances: [Bronze],
          cities: [0],
          units: [{ on: 0, attack: 1, defence: 5 }],
        },
        {
          advances: [Wheel],
          cities: [0],
          units: [{ on: 0, attack: 1, defence: 5 }],
        },
      ]),
      { log } = await meet(setup, (steps) => steps[0]);

    expect(log).include('Dialogue:computer.peace');
    expect(active(setup, Peace, setup.players[0], setup.players[1])).length(1);
    expect(setup.advances.get(setup.players[0])).include(Wheel);
  });
});
