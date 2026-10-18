import { declareWar, makePeace } from '../../lib/declareWar';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Acknowledge from '@civ-clone/core-diplomacy/Proposal/Acknowledge';
import Advance from '@civ-clone/core-science/Advance';
import CancelTreaty from '@civ-clone/library-diplomacy/Proposals/CancelTreaty';
import ChoiceMeta from '@civ-clone/core-client/ChoiceMeta';
import Criterion from '@civ-clone/core-rule/Criterion';
import DemandTribute from '@civ-clone/library-diplomacy/Proposals/DemandTribute';
import Dependencies from '../../lib/Dependencies';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import Effect from '@civ-clone/core-rule/Effect';
import ExchangeKnowledge from '@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import { IProposal } from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import { IResolution } from '@civ-clone/core-diplomacy/Proposal/Resolution';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import OfferPeace from '@civ-clone/library-diplomacy/Proposals/OfferPeace';
import OfferPeaceWithGift from '@civ-clone/library-diplomacy/Proposals/OfferPeaceWithGift';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Player from '@civ-clone/core-player/Player';
import Resolved from '@civ-clone/core-diplomacy/Rules/Proposal/Resolved';
import Vendetta from '@civ-clone/library-diplomacy/Declarations/Vendetta';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import { activeDeclarations } from '../../lib/declareWar';
import { knownMeeting } from '../../lib/meeting';

declare global {
  interface ChoiceMetaDataMap {
    'diplomacy.exchange-knowledge': typeof Advance;
  }
}

const negotiationOf = (proposal: IProposal): Negotiation =>
  (proposal as unknown as { negotiation(): Negotiation }).negotiation();

// What each answer in a meeting does (`Rules/Negotiation/step`).
export const getRules = (
  dependencies: Dependencies,
  random: () => number
): Resolved[] => {
  const {
      clientRegistry,
      playerResearchRegistry,
      playerTreasuryRegistry,
      ruleRegistry,
    } = dependencies,
    // Whatever the other player gives the computer player calms it: it's no longer hostile.
    calm = (proposal: IProposal): void => {
      const meeting = knownMeeting(negotiationOf(proposal));

      if (meeting !== null && proposal.by() === meeting.player) {
        meeting.stance.hostile = false;
      }
    },
    give = (gift: Advance | Gold, from: Player, to: Player): void => {
      if (gift instanceof Gold) {
        playerTreasuryRegistry
          .getByPlayerAndType(from, Gold)
          .subtract(gift.value());
        playerTreasuryRegistry.getByPlayerAndType(to, Gold).add(gift.value());

        return;
      }

      playerResearchRegistry.getByPlayer(to).addAdvance(gift.sourceClass());
    },
    accepted = (ProposalType: new (...args: any[]) => IProposal) =>
      new Criterion(
        (resolution: IResolution, proposal: IProposal): boolean =>
          resolution instanceof Accept && proposal instanceof ProposalType
      ),
    acknowledged = (...keys: string[]) =>
      new Criterion(
        (resolution: IResolution, proposal: IProposal): boolean =>
          resolution instanceof Acknowledge &&
          proposal instanceof Dialogue &&
          keys.some(
            (key) =>
              proposal.key() === key || proposal.key().startsWith(`${key}.`)
          )
      ),
    advancesLacked = (from: Player, by: Player): Advance[] => {
      const byResearch = playerResearchRegistry.getByPlayer(by);

      return playerResearchRegistry
        .getByPlayer(from)
        .complete()
        .filter(
          (advance: Advance) => !byResearch.completed(advance.sourceClass())
        );
    };

  return [
    new Resolved(
      'civ1-diplomacy:proposal/resolved/peace',
      accepted(OfferPeace),
      new Effect(
        async (resolution: IResolution, proposal: IProposal): Promise<void> => {
          if (proposal instanceof OfferPeaceWithGift) {
            proposal
              .gifts()
              .forEach((gift) => give(gift, proposal.by(), resolution.by()));
          }

          makePeace(dependencies, proposal.by(), resolution.by());
        }
      )
    ),

    new Resolved(
      'civ1-diplomacy:proposal/resolved/tribute',
      accepted(DemandTribute),
      new Effect(
        async (resolution: IResolution, proposal: IProposal): Promise<void> => {
          give(
            (proposal as DemandTribute).tribute(),
            resolution.by(),
            proposal.by()
          );

          calm(proposal);
        }
      )
    ),

    // The other player cancels its treaty with the computer player's enemy, who won't forget it. Half the time the
    //  computer player then waives its tribute (L853-930).
    new Resolved(
      'civ1-diplomacy:proposal/resolved/cancel-treaty',
      accepted(CancelTreaty),
      new Effect(
        async (resolution: IResolution, proposal: IProposal): Promise<void> => {
          const enemy = (proposal as CancelTreaty).with(),
            meeting = knownMeeting(negotiationOf(proposal));

          activeDeclarations(
            dependencies,
            Peace,
            resolution.by(),
            enemy
          ).forEach((peace) => peace.expire());

          dependencies.interactionRegistry.register(
            new Vendetta(enemy, resolution.by(), new Never(), ruleRegistry)
          );

          calm(proposal);

          if (meeting !== null && random() < 0.5) {
            meeting.stance.tribute = 0;
          }
        }
      )
    ),

    new Resolved(
      'civ1-diplomacy:proposal/resolved/exchange-knowledge',
      accepted(ExchangeKnowledge),
      new Effect(
        async (resolution: IResolution, proposal: IProposal): Promise<void> => {
          // `resolution.by()` agreed to the exchange; each side picks what it takes.
          const [by, other] = [resolution.by(), resolution.for()[0]],
            choose = (player: Player, from: Player) =>
              clientRegistry.getByPlayer(player).chooseFromList(
                new ChoiceMeta(
                  advancesLacked(from, player).map((advance) =>
                    advance.sourceClass()
                  ),
                  'diplomacy.exchange-knowledge',
                  resolution
                )
              ),
            byAdvance = await choose(by, other),
            otherAdvance = await choose(other, by);

          playerResearchRegistry.getByPlayer(by).addAdvance(byAdvance);
          playerResearchRegistry.getByPlayer(other).addAdvance(otherAdvance);

          calm(proposal);
        }
      )
    ),

    new Resolved(
      'civ1-diplomacy:proposal/resolved/declare-war',
      acknowledged('declare-war', 'computer.war'),
      new Effect(
        async (resolution: IResolution, proposal: IProposal): Promise<void> =>
          declareWar(dependencies, proposal.by(), resolution.by())
      )
    ),

    // Two computer players make peace, each giving the other an advance first if both have one to give
    //  (`Segment_2517.cs` `F0_2517_0cef`).
    new Resolved(
      'civ1-diplomacy:proposal/resolved/computer-peace',
      acknowledged('computer.peace'),
      new Effect(
        async (resolution: IResolution, proposal: IProposal): Promise<void> => {
          const [player, other] = [proposal.by(), resolution.by()],
            theirs = advancesLacked(other, player),
            ours = advancesLacked(player, other);

          if (theirs.length > 0 && ours.length > 0) {
            give(theirs[theirs.length - 1], other, player);
            give(ours[ours.length - 1], player, other);
          }

          makePeace(dependencies, player, other);
        }
      )
    ),
  ];
};

export default getRules;
