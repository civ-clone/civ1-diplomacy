import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';
import Effect from '@civ-clone/core-rule/Effect';
import Criterion from '@civ-clone/core-rule/Criterion';
import Accept from '@civ-clone/core-diplomacy/Proposal/Accept';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import ResolutionValue from '@civ-clone/core-diplomacy/Proposal/Resolution';
import Proposal, {
  IProposal,
} from '@civ-clone/core-diplomacy/Negotiation/Proposal';
import Dialogue from '@civ-clone/core-diplomacy/Negotiation/Dialogue';
import { IAction } from '@civ-clone/core-diplomacy/Negotiation/Action';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Initiate from '@civ-clone/core-diplomacy/Negotiation/Initiate';
import Decline from '@civ-clone/core-diplomacy/Proposal/Decline';
import { IInteraction } from '@civ-clone/core-diplomacy/Interaction';
import Step from '@civ-clone/core-diplomacy/Rules/Negotiation/Step';
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
import Acknowledge from '@civ-clone/core-diplomacy/Proposal/Acknowledge';
import Advance from '@civ-clone/core-science/Advance';
import ExchangeKnowledge from '@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge';
import OfferPeace from '@civ-clone/library-diplomacy/Proposals/OfferPeace';
import Player from '@civ-clone/core-player/Player';

export const getRules = (
  ruleRegistry: RuleRegistry = ruleRegistryInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance
) => {
  const onlyOncePerNegotiation = (
      InteractionType: IConstructor<IProposal>
    ): Criterion =>
      // if it's a `Resolution` it could be used many times in a discussion
      new Criterion(
        // TODO: also check the `for` and `proposer` fields match
        (negotiation) =>
          !interactionRegistry.getByPlayers(...negotiation.players()).some(
            (interaction) =>
              // We've already presented `InteractionType` within this `Negotiation`
              interaction instanceof InteractionType &&
              interaction.negotiation() === negotiation
          )
      ),
    lastInteractionWasResolutionForAction = (
      ActionType: IConstructor<IAction>
    ): Criterion =>
      new Criterion(
        (negotiation) =>
          negotiation.lastInteraction() instanceof ResolutionValue &&
          negotiation.lastInteraction().proposal() instanceof ActionType
      ),
    getNextBy = (negotiation: Negotiation) =>
      negotiation.lastInteraction() === null
        ? negotiation.players()[0]
        : negotiation.lastInteraction()!.for()[0],
    proposalAction = (ActionType: IConstructor<IAction>) =>
      new Effect(
        (negotiation) =>
          new ActionType(getNextBy(negotiation), negotiation, ruleRegistry)
      ),
    resolutionAction = (ActionType: typeof ResolutionValue) =>
      new Effect(
        (negotiation) =>
          new ActionType(
            getNextBy(negotiation),
            negotiation.lastInteraction(),
            ruleRegistry
          )
      ),
    dialogueAction = (ActionType: typeof Dialogue, key: string) =>
      new Effect(
        (negotiation) =>
          new ActionType(getNextBy(negotiation), key, negotiation, ruleRegistry)
      ),
    dialogueNamespaceMatches = (dialogue: Dialogue, namespace: string) =>
      dialogue.key().split('.')[0] === namespace,
    lastInteractionWasDialogueWithNamespace = (namespace: string) =>
      new Criterion((negotiation) => {
        const lastInteraction = negotiation.lastInteraction();

        return (
          lastInteraction instanceof Dialogue &&
          dialogueNamespaceMatches(lastInteraction, namespace)
        );
      }),
    hasPeaceTreaty = (...players: Player[]): boolean =>
      interactionRegistry.getByPlayers(...players).some(
        (interaction) =>
          // We already have a `Peace` treaty....
          interaction instanceof Peace && interaction.active()
      ),
    namedStateResults = {
      standardTopics: [
        [
          onlyOncePerNegotiation(OfferPeace),
          new Criterion(
            (negotiation) => !hasPeaceTreaty(...negotiation.players())
          ),
          proposalAction(OfferPeace),
        ],
        // [
        //   onlyOncePerNegotiation(DemandTribute),
        //   new Effect(
        //     (negotiation) =>
        //       new DemandTribute(new Gold(50), getNextBy(negotiation), negotiation, ruleRegistry)
        //   ),
        //   // TODO: check relationship status and relative 'strength'
        // ],
        [
          new Criterion((negotiation) => {
            const [firstPlayerResearch, secondPlayerResearch] = negotiation
                .players()
                .map((player: Player) =>
                  playerResearchRegistry.getByPlayer(player)
                ),
              firstPlayerAdvances = firstPlayerResearch
                .complete()
                .filter(
                  (completedAdvance: Advance) =>
                    !secondPlayerResearch.completed(
                      completedAdvance.sourceClass()
                    )
                ),
              secondPlayerAdvances = secondPlayerResearch
                .complete()
                .filter(
                  (completedAdvance: Advance) =>
                    !firstPlayerResearch.completed(
                      completedAdvance.sourceClass()
                    )
                );

            return (
              firstPlayerAdvances.length > 0 && secondPlayerAdvances.length > 0
            );
          }),
          proposalAction(ExchangeKnowledge),
        ],
        // [
        //   proposalAction(DeclareWarOnPlayer),
        //   // TODO: check that proposed `Player` is not currently at `War` with the mutual `Player`
        // ],
        [proposalAction(Terminate)],
      ],
    },
    acceptDecline = [[resolutionAction(Accept)], [resolutionAction(Decline)]],
    diplomacyNegotiationMap = [
      [[null], [[proposalAction(Initiate)]]],
      [[Initiate], acceptDecline],
      [
        [Decline, lastInteractionWasResolutionForAction(Initiate)],
        [[proposalAction(Terminate)]],
      ],
      [
        [
          Accept,
          lastInteractionWasResolutionForAction(Initiate),
          new Criterion(
            (negotiation) => !hasPeaceTreaty(...negotiation.players())
          ),
        ],
        [[dialogueAction(Dialogue, 'welcome.no-peace')]],
      ],
      [
        [
          Accept,
          lastInteractionWasResolutionForAction(Initiate),
          new Criterion((negotiation) =>
            hasPeaceTreaty(...negotiation.players())
          ),
        ],
        [[dialogueAction(Dialogue, 'welcome.peace')]],
      ],
      // Some more examples:
      // [
      //   [Accept, lastInteractionWasResolutionForAction(Initiate)],
      //   [[
      //     new Criterion((negotiation) => unitRegistry.getByPlayer(negotiation.lastInteraction().proposal().by()).filter((unit) => unit instanceof Nuclear).length > 0),
      //     dialogueAction(Dialogue, 'welcome.neutral.backed-by-nuclear-weapons')
      //     // and the inverse of things too
      //   ]],
      // ],
      // [
      //   [Accept, lastInteractionWasResolutionForAction(Initiate)],
      //   [[
      //     new Criterion((negotiation) => unitRegistry.getByPlayer(negotiation.lastInteraction().proposal().by()).filter((unit) => unit instanceof Nuclear).length > 0),
      //     dialogueAction(Dialogue, 'welcome.neutral.backed-by-nuclear-weapons')
      //   ]],
      // ],

      [
        [Dialogue, lastInteractionWasDialogueWithNamespace('welcome')],
        [[resolutionAction(Acknowledge)]],
      ],

      [
        [Acknowledge, lastInteractionWasResolutionForAction(Dialogue)],
        namedStateResults.standardTopics,
      ],

      [[OfferPeace], acceptDecline],
      [
        [Decline, lastInteractionWasResolutionForAction(OfferPeace)],
        [[dialogueAction(Dialogue, 'decline-peace.neutral')]],
      ],
      [
        [Accept, lastInteractionWasResolutionForAction(OfferPeace)],
        [[dialogueAction(Dialogue, 'accept-peace.neutral')]],
      ],

      [
        [Dialogue, lastInteractionWasDialogueWithNamespace('decline-peace')],
        [[resolutionAction(Acknowledge)]],
      ],
      [
        [Dialogue, lastInteractionWasDialogueWithNamespace('accept-peace')],
        [[resolutionAction(Acknowledge)]],
      ],
      // [[DemandTribute], acceptDecline],
      //
      // [
      //   [Decline, lastInteractionWasResolutionForAction(DemandTribute)],
      //   [[dialogueAction(Dialogue, 'decline-demand.neutral')]],
      // ],
      // [
      //   [Accept, lastInteractionWasResolutionForAction(DemandTribute)],
      //   [[dialogueAction(Dialogue, 'accept-demand.neutral')]],
      // ],

      [
        [Dialogue, lastInteractionWasDialogueWithNamespace('decline-demand')],
        [[resolutionAction(Acknowledge)]],
      ],
      [
        [Dialogue, lastInteractionWasDialogueWithNamespace('accept-demand')],
        [[resolutionAction(Acknowledge)]],
      ],

      [[ExchangeKnowledge], acceptDecline],
      [
        [Decline, lastInteractionWasResolutionForAction(ExchangeKnowledge)],
        namedStateResults.standardTopics,
      ],
      [
        [Accept, lastInteractionWasResolutionForAction(ExchangeKnowledge)],
        namedStateResults.standardTopics,
      ],
    ] as [
      [IConstructor<IInteraction> | null, ...Criterion[]],
      (Criterion | Effect)[][]
    ][];

  return [
    ...diplomacyNegotiationMap.flatMap(
      ([
        [SourceInteractionType, ...additionalCriteria],
        validNextInteractions,
      ]: [
        [IConstructor<IInteraction> | null, ...Criterion[]],
        (Criterion | Effect)[][]
      ]) =>
        validNextInteractions.map(
          ([...effectsAndCriteria]: [...(Criterion | Effect)[]]) =>
            new Step(
              new Criterion((negotiation: Negotiation) =>
                SourceInteractionType === null
                  ? negotiation.lastInteraction() === null
                  : negotiation.lastInteraction() instanceof
                    SourceInteractionType
              ),
              ...additionalCriteria,
              ...effectsAndCriteria
            )
        )
    ),
  ];
};

export default getRules;
