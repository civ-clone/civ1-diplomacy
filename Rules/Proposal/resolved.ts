import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Advance from '@civ-clone/core-science/Advance';
import ChoiceMeta from '@civ-clone/core-client/ChoiceMeta';
import Criterion from '@civ-clone/core-rule/Criterion';
import Decline from '@civ-clone/core-diplomacy/Proposal/Decline';
import Effect from '@civ-clone/core-rule/Effect';
import ExchangeKnowledge from '@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Initiate from '@civ-clone/core-diplomacy/Negotiation/Initiate';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import OfferPeace from '@civ-clone/library-diplomacy/Proposals/OfferPeace';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Resolved from '@civ-clone/core-diplomacy/Rules/Proposal/Resolved';
import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';

declare global {
  interface ChoiceMetaDataMap {
    'diplomacy.exchange-knowledge': typeof Advance;
  }
}

export const getRules = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance
) => [
  new Resolved(
    new Criterion(
      (resolution, proposal) =>
        resolution instanceof Decline && proposal instanceof Initiate
    ),
    new Effect(async (resolution, proposal) =>
      proposal
        .negotiation()
        .proceed(
          new Terminate(resolution.by(), proposal.negotiation(), ruleRegistry)
        )
    )
  ),
  new Resolved(
    new Criterion(
      (resolution, proposal) =>
        resolution instanceof Accept && proposal instanceof OfferPeace
    ),
    new Effect(async (resolution, proposal) =>
      interactionRegistry.register(
        new Peace(...proposal.players(), new Never(), ruleRegistry)
      )
    )
  ),
  new Resolved(
    new Criterion(
      (resolution, proposal) =>
        resolution instanceof Accept && proposal instanceof ExchangeKnowledge
    ),
    new Effect(async (resolution, proposal) => {
      // resolution.by() is the person that agreed to the exchange
      const byResearch = playerResearchRegistry.getByPlayer(resolution.by()),
        forResearch = playerResearchRegistry.getByPlayer(resolution.for()[0]),
        forAdvances = byResearch
          .complete()
          .filter(
            (completedAdvance) =>
              !forResearch.completed(completedAdvance.sourceClass())
          ),
        byAdvances = forResearch
          .complete()
          .filter(
            (completedAdvance) =>
              !byResearch.completed(completedAdvance.sourceClass())
          );

      const byClient = clientRegistry.getByPlayer(resolution.by()),
        byAdvance = await byClient.chooseFromList(
          new ChoiceMeta(
            byAdvances.map((advance) => advance.sourceClass()),
            'diplomacy.exchange-knowledge',
            resolution
          )
        ),
        forClient = clientRegistry.getByPlayer(resolution.for()[0]),
        forAdvance = await forClient.chooseFromList(
          new ChoiceMeta(
            forAdvances.map((advance) => advance.sourceClass()),
            'diplomacy.exchange-knowledge',
            resolution
          )
        );

      byResearch.addAdvance(byAdvance);
      forResearch.addAdvance(forAdvance);
    })
  ),
];

export default getRules;
