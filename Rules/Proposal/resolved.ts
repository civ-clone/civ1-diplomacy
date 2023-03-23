import {
  instance as ruleRegistryInstance,
  RuleRegistry,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  instance as interactionRegistryInstance,
  InteractionRegistry,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  instance as playerResearchRegistryInstance,
  PlayerResearchRegistry,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import Resolved from '@civ-clone/core-diplomacy/Rules/Proposal/Resolved';
import Criterion from '@civ-clone/core-rule/Criterion';
import Decline from '@civ-clone/core-diplomacy/Proposal/Decline';
import Initiate from '@civ-clone/core-diplomacy/Negotiation/Initiate';
import Effect from '@civ-clone/core-rule/Effect';
import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import OfferPeace from '@civ-clone/library-diplomacy/Proposals/OfferPeace';
import ExchangeKnowledge from '@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge';

export const getRules = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
) => [
  new Resolved(
    new Criterion(
      (resolution, proposal) =>
        resolution instanceof Decline && proposal instanceof Initiate
    ),
    new Effect((resolution, proposal) =>
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
    new Effect((resolution, proposal) =>
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
    new Effect((resolution, proposal) => {
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

      // TODO: client.chooseFromList()
      // const byClient = clientRegistry.getByPlayer(resolution.by()),
      //   byAdvance = await byClient.chooseFromList(new ChoiceMeta(byAdvances.map((advance) => advance.sourceClass()), 'diplomacy.exchange-knowledge', resolution)),
      //   forClient = clientRegistry.getByPlayer(resolution.for()[0]),
      //   forAdvance = await forClient.chooseFromList(new ChoiceMeta(forAdvances.map((advance) => advance.sourceClass()), 'diplomacy.exchange-knowledge', resolution));
      //
      // byResearch.add(byAdvance);
      // forResearch.add(forAdvance);

      byResearch.addAdvance(byAdvances[0].sourceClass());
      forResearch.addAdvance(forAdvances[0].sourceClass());
    })
  ),
];

export default getRules;
