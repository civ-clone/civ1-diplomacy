import { cityCount, gold, republican } from '../../lib/standing';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Acknowledge from '@civ-clone/core-diplomacy/Proposal/Acknowledge';
import Advance from '@civ-clone/core-science/Advance';
import AdvanceTaken from '../../Dialogues/AdvanceTaken';
import CancelTreaty from '@civ-clone/library-diplomacy/Proposals/CancelTreaty';
import Criterion from '@civ-clone/core-rule/Criterion';
import Decline from '@civ-clone/core-diplomacy/Proposal/Decline';
import DemandTribute from '@civ-clone/library-diplomacy/Proposals/DemandTribute';
import Dependencies from '../../lib/Dependencies';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import Effect from '@civ-clone/core-rule/Effect';
import ExchangeKnowledge from '@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import Initiate from '@civ-clone/core-diplomacy/Negotiation/Initiate';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import OfferPeace from '@civ-clone/library-diplomacy/Proposals/OfferPeace';
import OfferPeaceWithGift from '@civ-clone/library-diplomacy/Proposals/OfferPeaceWithGift';
import Player from '@civ-clone/core-player/Player';
import Proposal from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Resolution from '@civ-clone/core-diplomacy/Proposal/Resolution';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';
import { hasVendetta } from '@civ-clone/library-diplomacy/lib/holds';
import { meetingFor } from '../../lib/meeting';
import { takenBy } from '../../lib/exchanged';

type Next = (negotiation: Negotiation) => IAction | null;

// A meeting between a computer player and another, as v474.05 holds one (OpenCivOne `MeetWithKing.cs`
//  `F6_0000_0000`; civ-clone/web-renderer#427). The computer player, the first of the negotiation's players, came to
//  talk. It has one thing to say at each turn, in v474.05's order, and the other player answers:
//
//  1. Its greeting, then knowledge to swap, for as long as both have something new for the other.
//  2. A call to cancel the other's treaty with its enemy; tribute in gold; failing that, an advance.
//  3. Still hostile, war: when it's provoked (at peace, with a demand made), its demand was refused, or at first
//     contact. Otherwise peace: offered, then sweetened when it's refused (an advance, then gold, then everything it
//     has), and war if it's still refused. At peace already, it hands over to the other player, who may demand
//     tribute in turn.
//
// Two computer players don't parley: they meet, and the game decides war or peace (`wouldGoToWar`).
//
// Nothing here changes the meeting: what has been said so far is read from the negotiation, so the steps can be
//  asked for as often as a client likes. The answers' effects are in `Rules/Proposal/resolved`.
export const getRules = (
  dependencies: Dependencies,
  random: () => number
): Step[] => {
  const { playerResearchRegistry, ruleRegistry } = dependencies,
    meeting = (negotiation: Negotiation) =>
      meetingFor(dependencies, negotiation, random),
    last = (negotiation: Negotiation): IAction | null =>
      negotiation.lastInteraction(),
    said = <T extends IAction>(
      negotiation: Negotiation,
      ActionType: new (...args: any[]) => T,
      by: Player,
      matches: (action: T) => boolean = () => true
    ): T[] =>
      negotiation
        .interactions()
        .filter(
          (action): action is T =>
            action instanceof ActionType &&
            action.by() === by &&
            matches(action as T)
        ),
    answered = (
      negotiation: Negotiation,
      ResolutionType: typeof Resolution,
      ProposalType: new (...args: any[]) => IAction,
      matches: (proposal: any) => boolean = () => true
    ): boolean =>
      negotiation
        .interactions()
        .some(
          (action) =>
            action instanceof ResolutionType &&
            action.proposal() instanceof ProposalType &&
            matches(action.proposal())
        ),
    lastWas = (
      negotiation: Negotiation,
      ResolutionType: typeof Resolution,
      ...ProposalTypes: (new (...args: any[]) => IAction)[]
    ): boolean => {
      const action = last(negotiation);

      return (
        action instanceof ResolutionType &&
        ProposalTypes.some(
          (ProposalType) => action.proposal() instanceof ProposalType
        )
      );
    },
    acknowledged = (
      negotiation: Negotiation,
      ...namespaces: string[]
    ): boolean => {
      const action = last(negotiation);

      return (
        action instanceof Acknowledge &&
        action.proposal() instanceof Dialogue &&
        namespaces.includes((action.proposal() as Dialogue).key().split('.')[0])
      );
    },
    // Whether the last step was `player`'s dialogue `key`, still unanswered.
    justSaid = (negotiation: Negotiation, key: string): boolean => {
      const action = last(negotiation);

      return action instanceof Dialogue && action.key() === key;
    },
    advancesLacked = (from: Player, by: Player): Advance[] => {
      const byResearch = playerResearchRegistry.getByPlayer(by);

      return playerResearchRegistry
        .getByPlayer(from)
        .complete()
        .filter((advance: Advance): boolean => {
          const AdvanceType = advance.sourceClass<typeof Advance>();

          return !AdvanceType.repeatable && !byResearch.completed(AdvanceType);
        });
    },
    known = (player: Player): number =>
      playerResearchRegistry.getByPlayer(player).complete().length,
    goldDemanded = (tribute: DemandTribute) =>
      tribute.tribute() instanceof Gold,
    say = (negotiation: Negotiation, key: string): IAction =>
      new Dialogue(meeting(negotiation).player, key, negotiation, ruleRegistry),
    end = (negotiation: Negotiation, by: Player): IAction =>
      new Terminate(by, negotiation, ruleRegistry),
    // What the computer player says next, after its greeting and after each answer.
    nextTopic: Next = (negotiation) => {
      const { player, other, stance } = meeting(negotiation),
        theirs = advancesLacked(other, player),
        ours = advancesLacked(player, other);

      // Knowledge (L664-822): while `player` knows six advances or fewer, or isn't hostile, and the other knows as
      //  many as it does, and each has something new for the other. Once turned down, not again.
      if (
        !answered(negotiation, Decline, ExchangeKnowledge) &&
        (known(player) <= 6 || !stance.hostile) &&
        known(other) >= known(player) &&
        theirs.length > 0 &&
        ours.length > 0
      ) {
        // What it offers: what it knows and the other doesn't (civ-clone/web-renderer#453).
        return new ExchangeKnowledge(ours, player, negotiation, ruleRegistry);
      }

      // A call to cancel a treaty with `player`'s enemy (L853-930).
      if (
        said(negotiation, CancelTreaty, player).length === 0 &&
        stance.mode !== 0 &&
        stance.enemyAtPeaceWithOther !== null
      ) {
        return new CancelTreaty(
          stance.enemyAtPeaceWithOther,
          player,
          negotiation,
          ruleRegistry
        );
      }

      const tributes = said(negotiation, DemandTribute, player);

      // Tribute (L933-985), which only a hostile player demands, and only of gold the other has.
      if (
        tributes.length === 0 &&
        stance.tribute !== 0 &&
        stance.mode === 2 &&
        gold(dependencies, other) > stance.tribute
      ) {
        return new DemandTribute(
          new Gold(stance.tribute),
          player,
          negotiation,
          ruleRegistry
        );
      }

      // Failing tribute, an advance (L988-1033): the most recent of the other's that `player` lacks.
      if (tributes.length === 0 && stance.mode !== 0 && theirs.length > 0) {
        return new DemandTribute(
          theirs[theirs.length - 1],
          player,
          negotiation,
          ruleRegistry
        );
      }

      return conclusion(negotiation);
    },
    // War or peace (L1036-1453).
    conclusion: Next = (negotiation) => {
      const { firstContact, player, stance } = meeting(negotiation),
        demanded =
          said(negotiation, DemandTribute, player, goldDemanded).length > 0,
        refused = answered(
          negotiation,
          Decline,
          DemandTribute,
          (tribute: DemandTribute) =>
            tribute.by() === player && goldDemanded(tribute)
        );

      if (stance.hostile) {
        // v474.05 marks a demand made by setting the tribute to 999, so it counts as more than 50 here.
        if (stance.atPeace && (demanded || stance.tribute > 50)) {
          return say(negotiation, 'declare-war.provoked');
        }

        if (!stance.atPeace && refused) {
          return say(negotiation, 'declare-war.rejected');
        }

        if (firstContact) {
          return say(negotiation, 'declare-war.first-contact');
        }

        return say(negotiation, 'farewell.hostile');
      }

      if (stance.atPeace) {
        return say(negotiation, 'handover');
      }

      return new OfferPeace(player, negotiation, ruleRegistry);
    },
    // A refused peace, sweetened (L1300-1453): an advance if `player` fears the other enough, then gold, then all it
    //  has if it's down to one city, and war once there's nothing left to offer.
    sweetener: Next = (negotiation) => {
      const { player, other, stance } = meeting(negotiation),
        ours = advancesLacked(player, other),
        treasury = gold(dependencies, player),
        offered = said(negotiation, OfferPeaceWithGift, player),
        tried = new Set(offered.map((offer) => offer.kind())),
        offer = (kind: string, gifts: (Advance | Gold)[]): IAction =>
          new OfferPeaceWithGift(
            kind,
            gifts,
            player,
            negotiation,
            ruleRegistry
          ),
        steps: [string, () => (Advance | Gold)[] | null][] = [
          [
            'advance',
            () =>
              stance.fear >= 4 && ours.length > 0
                ? [ours[ours.length - 1]]
                : null,
          ],
          [
            'gold',
            () => {
              const amount =
                Math.min(
                  Math.max(2 * stance.fear - 4, 0),
                  Math.trunc(treasury / 50)
                ) * 50;

              return amount > 0 ? [new Gold(amount)] : null;
            },
          ],
          [
            'everything',
            () =>
              stance.fear !== 0 &&
              cityCount(dependencies, player) <= 1 &&
              (ours.length > 0 || treasury > 0)
                ? [...ours, ...(treasury > 0 ? [new Gold(treasury)] : [])]
                : null,
          ],
        ];

      // Each is tried once, in order, after the one before it (whether offered or skipped).
      const lastTried = Math.max(
        -1,
        ...steps.map(([key], index) => (tried.has(key) ? index : -1))
      );

      for (const [key, gifts] of steps.slice(lastTried + 1)) {
        const chosen = gifts();

        if (chosen !== null) {
          return offer(key, chosen);
        }
      }

      return say(negotiation, 'declare-war.mobilize');
    },
    // The other player's demand once the computer player hands over, at peace (L1466-1808), unless it's a Republic or
    //  Democracy: the computer player gives what it fears to refuse, `fear` in fifties up to what it has.
    handoverDemand: Next = (negotiation) => {
      const { player, other, stance } = meeting(negotiation);

      if (republican(dependencies, other)) {
        return null;
      }

      const amount =
        Math.min(
          Math.max(stance.fear, 0),
          Math.trunc(gold(dependencies, player) / 50)
        ) * 50;

      return new DemandTribute(
        new Gold(amount),
        other,
        negotiation,
        ruleRegistry
      );
    },
    theOtherDemanded = (negotiation: Negotiation): DemandTribute | null => {
      const action = last(negotiation);

      return action instanceof DemandTribute &&
        action.by() === meeting(negotiation).other
        ? action
        : null;
    },
    proposedByComputer = (negotiation: Negotiation): IAction | null => {
      const action = last(negotiation);

      return (action instanceof ExchangeKnowledge ||
        action instanceof CancelTreaty ||
        action instanceof OfferPeace ||
        action instanceof DemandTribute) &&
        action.by() === meeting(negotiation).player
        ? action
        : null;
    },
    rows: [(negotiation: Negotiation) => boolean, Next][] = [
      [
        (negotiation) => last(negotiation) === null,
        (negotiation) =>
          new Initiate(negotiation.players()[0], negotiation, ruleRegistry),
      ],
      [
        (negotiation) => last(negotiation) instanceof Initiate,
        (negotiation) =>
          new Accept(
            negotiation.players()[1],
            last(negotiation)! as unknown as Proposal,
            ruleRegistry
          ),
      ],
      [
        (negotiation) => last(negotiation) instanceof Initiate,
        (negotiation) =>
          new Decline(
            negotiation.players()[1],
            last(negotiation)! as unknown as Proposal,
            ruleRegistry
          ),
      ],
      // Turning the emissary away doesn't stop a hostile computer player declaring war.
      [
        (negotiation) => lastWas(negotiation, Decline, Initiate),
        (negotiation) => {
          const { computer, player, stance } = meeting(negotiation);

          return computer === null && stance.hostile
            ? conclusion(negotiation)
            : end(negotiation, player);
        },
      ],
      [
        (negotiation) => lastWas(negotiation, Accept, Initiate),
        (negotiation) => {
          const { computer, other, player, stance } = meeting(negotiation);

          if (computer !== null) {
            return say(negotiation, `computer.${computer}`);
          }

          if (hasVendetta(player, other, dependencies.interactionRegistry)) {
            return say(negotiation, 'welcome.vendetta');
          }

          return say(
            negotiation,
            stance.atPeace ? 'welcome.peace' : 'welcome.no-peace'
          );
        },
      ],
      // Every dialogue is acknowledged by the player it's said to, but the hand-over: the other answers that with its
      //  reply, so "You respond..." is where it chooses one (civ-clone/web-renderer#454).
      [
        (negotiation) =>
          last(negotiation) instanceof Dialogue &&
          !justSaid(negotiation, 'handover'),
        (negotiation) =>
          new Acknowledge(
            meeting(negotiation).other,
            last(negotiation)! as unknown as Proposal,
            ruleRegistry
          ),
      ],
      [
        (negotiation) =>
          acknowledged(negotiation, 'welcome', 'exchange-knowledge'),
        nextTopic,
      ],
      [
        (negotiation) =>
          acknowledged(
            negotiation,
            'computer',
            'declare-war',
            'farewell',
            'accept-peace'
          ),
        (negotiation) => end(negotiation, meeting(negotiation).player),
      ],
      [(negotiation) => justSaid(negotiation, 'handover'), handoverDemand],
      [
        (negotiation) => justSaid(negotiation, 'handover'),
        (negotiation) => end(negotiation, meeting(negotiation).other),
      ],
      // The computer player's proposals, answered by the other player.
      [
        (negotiation) => proposedByComputer(negotiation) !== null,
        (negotiation) =>
          new Accept(
            meeting(negotiation).other,
            last(negotiation)! as unknown as Proposal,
            ruleRegistry
          ),
      ],
      [
        (negotiation) => proposedByComputer(negotiation) !== null,
        (negotiation) =>
          new Decline(
            meeting(negotiation).other,
            last(negotiation)! as unknown as Proposal,
            ruleRegistry
          ),
      ],
      [
        (negotiation) => lastWas(negotiation, Accept, OfferPeace),
        (negotiation) => say(negotiation, 'accept-peace.neutral'),
      ],
      [(negotiation) => lastWas(negotiation, Decline, OfferPeace), sweetener],
      [
        (negotiation) =>
          lastWas(
            negotiation,
            Accept,
            ExchangeKnowledge,
            CancelTreaty,
            DemandTribute
          ) ||
          lastWas(
            negotiation,
            Decline,
            ExchangeKnowledge,
            CancelTreaty,
            DemandTribute
          ),
        (negotiation) => {
          const resolution = last(negotiation) as Resolution,
            { player } = meeting(negotiation),
            taken =
              resolution instanceof Accept &&
              resolution.proposal() instanceof ExchangeKnowledge
                ? takenBy(resolution.proposal(), player)
                : null;

          if (taken !== null) {
            // It says what it took, then carries on (civ-clone/web-renderer#453).
            return new AdvanceTaken(player, taken, negotiation, ruleRegistry);
          }

          return resolution.proposal().by() === player
            ? nextTopic(negotiation)
            : // The other player's demand, answered: the meeting is over.
              end(negotiation, meeting(negotiation).other);
        },
      ],
      // The computer player answers the other's demand: it pays if what it would give comes to anything.
      [
        (negotiation) => theOtherDemanded(negotiation) !== null,
        (negotiation) => {
          const demand = theOtherDemanded(negotiation)!,
            tribute = demand.tribute(),
            { player } = meeting(negotiation);

          return tribute instanceof Gold && tribute.value() > 0
            ? new Accept(player, demand as unknown as Proposal, ruleRegistry)
            : new Decline(player, demand as unknown as Proposal, ruleRegistry);
        },
      ],
    ];

  return rows.map(
    ([applies, next]) =>
      new Step(
        new Criterion(
          (negotiation: Negotiation): boolean =>
            applies(negotiation) && next(negotiation) !== null
        ),
        new Effect((negotiation: Negotiation): IAction => next(negotiation)!)
      )
  );
};

export default getRules;
