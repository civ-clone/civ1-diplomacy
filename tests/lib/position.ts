import { Aggressive, Friendly } from '@civ-clone/civ1-civilization/Traits';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Advance from '@civ-clone/core-science/Advance';
import Criterion from '@civ-clone/core-rule/Criterion';
import Dependencies from '../../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import InteractionRegistry from '@civ-clone/core-diplomacy/InteractionRegistry';
import LandMass from '@civ-clone/core-world/LandMass';
import { Nuclear } from '@civ-clone/civ1-unit/Units';
import Pacified from '@civ-clone/library-diplomacy/Rules/Player/Pacified';
import Player from '@civ-clone/core-player/Player';
import Rank from '@civ-clone/core-power/Rules/Rank';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Strength from '@civ-clone/core-power/Rules/Strength';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';

// A hand-built position for the meeting's arithmetic: who has what where, with stand-ins for everything the meeting
//  only reads. Land masses are lists of stand-in tiles; a unit or city is on one of them, or at sea.
export interface Side {
  human?: boolean;
  gold?: number;
  rank?: number;
  mood?: -1 | 0 | 1;
  republic?: boolean;
  advances?: (typeof Advance)[];
  units?: { on: number | null; attack: number; defence: number; nuclear?: boolean }[];
  cities?: number[];
}

export class Bronze extends Advance {}
export class Wheel extends Advance {}
export class Alphabet extends Advance {}
export class Writing extends Advance {}

export const position = (
  sides: Side[],
  {
    landMasses = 3,
    level = 3,
    turn = 100,
    pacified = [],
  }: {
    landMasses?: number;
    level?: number;
    turn?: number;
    pacified?: [number, number][];
  } = {}
) => {
  const ruleRegistry = new RuleRegistry(),
    interactionRegistry = new InteractionRegistry(),
    tiles = Array.from({ length: landMasses }, () => [{} as Tile]),
    masses = tiles.map((landMassTiles) => new LandMass(landMassTiles)),
    sea = {} as Tile,
    players = sides.map(() => new Player(ruleRegistry)),
    gold = new Map(players.map((player, index) => [player, sides[index].gold ?? 0])),
    advances = new Map(
      players.map((player, index) => [player, [...(sides[index].advances ?? [])]])
    ),
    units = new Map(
      players.map((player, index) => [
        player,
        (sides[index].units ?? []).map(({ on, attack, defence, nuclear }) =>
          Object.assign(Object.create((nuclear ? Nuclear : Unit).prototype), {
            attack: () => ({ value: () => attack }),
            defence: () => ({ value: () => defence }),
            player: () => player,
            tile: () => (on === null ? sea : tiles[on][0]),
          })
        ),
      ])
    ),
    cities = new Map(
      players.map((player, index) => [
        player,
        (sides[index].cities ?? []).map((on) => ({
          player: () => player,
          tile: () => tiles[on][0],
        })),
      ])
    );

  ruleRegistry.register(
    new Strength(
      new Effect((unit: Unit) => ({
        attack: unit.attack().value(),
        defence: unit.defence().value(),
      }))
    ),
    new Rank(new Effect((player: Player) => sides[players.indexOf(player)].rank ?? 0)),
    ...pacified.map(
      ([who, towards]) =>
        new Pacified(
          new Criterion(
            (player: Player, other: Player) =>
              player === players[who] && other === players[towards]
          ),
          new Effect(() => true)
        )
    )
  );

  const traits = (player: Player) => {
    const mood = sides[players.indexOf(player)].mood ?? 0;

    return mood === 1
      ? [Object.create(Aggressive.prototype)]
      : mood === -1
      ? [Object.create(Friendly.prototype)]
      : [];
  };

  // Every player has a leader the trait registry knows by its stand-in class.
  players.forEach((player) =>
    Object.assign(player, {
      civilization: () => ({
        leader: () => ({ sourceClass: () => player }),
      }),
    })
  );

  const dependencies = {
    cityRegistry: {
      getByPlayer: (player: Player) => cities.get(player) ?? [],
      getByTile: (tile: Tile) =>
        Array.from(cities.values())
          .flat()
          .find((city) => city.tile() === tile) ?? null,
    },
    clientRegistry: {
      getBy: (key: string, player: Player) => [
        sides[players.indexOf(player)].human
          ? {}
          : Object.create(AIClient.prototype),
      ],
      getByPlayer: () => ({
        chooseFromList: async (meta: any) => meta.choices()[0].value(),
      }),
    },
    gameDifficultyRegistry: { get: () => ({ level: () => level }) },
    interactionRegistry,
    landMassRegistry: { entries: () => masses },
    playerGovernmentRegistry: {
      getByPlayer: (player: Player) => ({
        is: () => sides[players.indexOf(player)].republic ?? false,
        set: () => {},
      }),
    },
    playerRegistry: { entries: () => players },
    playerResearchRegistry: {
      getByPlayer: (player: Player) => ({
        complete: () =>
          advances.get(player)!.map((AdvanceType) => ({
            sourceClass: () => AdvanceType,
          })),
        completed: (AdvanceType: typeof Advance) =>
          advances.get(player)!.includes(AdvanceType),
        addAdvance: (AdvanceType: typeof Advance) =>
          advances.get(player)!.push(AdvanceType),
      }),
    },
    playerTreasuryRegistry: {
      getByPlayerAndType: (player: Player) => ({
        value: () => gold.get(player)!,
        add: (value: number) => gold.set(player, gold.get(player)! + value),
        subtract: (value: number) => gold.set(player, gold.get(player)! - value),
      }),
    },
    ruleRegistry,
    traitRegistry: { getByLeader: (leader: unknown) => traits(leader as Player) },
    turn: { value: () => turn },
    unitRegistry: { getByPlayer: (player: Player) => units.get(player) ?? [] },
  } as unknown as Dependencies;

  return { advances, dependencies, gold, interactionRegistry, players, ruleRegistry };
};

export default position;
