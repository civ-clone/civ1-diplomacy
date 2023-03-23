"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Terminate_1 = require("@civ-clone/core-diplomacy/Negotiation/Terminate");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Accept_1 = require("@civ-clone/core-diplomacy/Proposal/Accept");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const Resolution_1 = require("@civ-clone/core-diplomacy/Proposal/Resolution");
const Dialogue_1 = require("@civ-clone/core-diplomacy/Negotiation/Dialogue");
const Initiate_1 = require("@civ-clone/core-diplomacy/Negotiation/Initiate");
const Decline_1 = require("@civ-clone/core-diplomacy/Proposal/Decline");
const Step_1 = require("@civ-clone/core-diplomacy/Rules/Negotiation/Step");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Acknowledge_1 = require("@civ-clone/core-diplomacy/Proposal/Acknowledge");
const ExchangeKnowledge_1 = require("@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge");
const OfferPeace_1 = require("@civ-clone/library-diplomacy/Proposals/OfferPeace");
const getRules = (ruleRegistry = RuleRegistry_1.instance, interactionRegistry = InteractionRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance) => {
    const onlyOncePerNegotiation = (InteractionType) => 
    // if it's a `Resolution` it could be used many times in a discussion
    new Criterion_1.default(
    // TODO: also check the `for` and `proposer` fields match
    (negotiation) => !interactionRegistry.getByPlayers(...negotiation.players()).some((interaction) => 
    // We've already presented `InteractionType` within this `Negotiation`
    interaction instanceof InteractionType &&
        interaction.negotiation() === negotiation)), lastInteractionWasResolutionForAction = (ActionType) => new Criterion_1.default((negotiation) => negotiation.lastInteraction() instanceof Resolution_1.default &&
        negotiation.lastInteraction().proposal() instanceof ActionType), getNextBy = (negotiation) => negotiation.lastInteraction() === null
        ? negotiation.players()[0]
        : negotiation.lastInteraction().for()[0], proposalAction = (ActionType) => new Effect_1.default((negotiation) => new ActionType(getNextBy(negotiation), negotiation, ruleRegistry)), resolutionAction = (ActionType) => new Effect_1.default((negotiation) => new ActionType(getNextBy(negotiation), negotiation.lastInteraction(), ruleRegistry)), dialogueAction = (ActionType, key) => new Effect_1.default((negotiation) => new ActionType(getNextBy(negotiation), key, negotiation, ruleRegistry)), dialogueNamespaceMatches = (dialogue, namespace) => dialogue.key().split('.')[0] === namespace, lastInteractionWasDialogueWithNamespace = (namespace) => new Criterion_1.default((negotiation) => {
        const lastInteraction = negotiation.lastInteraction();
        return (lastInteraction instanceof Dialogue_1.default &&
            dialogueNamespaceMatches(lastInteraction, namespace));
    }), hasPeaceTreaty = (...players) => interactionRegistry.getByPlayers(...players).some((interaction) => 
    // We already have a `Peace` treaty....
    interaction instanceof Peace_1.default && interaction.active()), namedStateResults = {
        standardTopics: [
            [
                onlyOncePerNegotiation(OfferPeace_1.default),
                new Criterion_1.default((negotiation) => !hasPeaceTreaty(...negotiation.players())),
                proposalAction(OfferPeace_1.default),
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
                new Criterion_1.default((negotiation) => {
                    const [firstPlayerResearch, secondPlayerResearch] = negotiation
                        .players()
                        .map((player) => playerResearchRegistry.getByPlayer(player)), firstPlayerAdvances = firstPlayerResearch
                        .complete()
                        .filter((completedAdvance) => !secondPlayerResearch.completed(completedAdvance.sourceClass())), secondPlayerAdvances = secondPlayerResearch
                        .complete()
                        .filter((completedAdvance) => !firstPlayerResearch.completed(completedAdvance.sourceClass()));
                    return (firstPlayerAdvances.length > 0 && secondPlayerAdvances.length > 0);
                }),
                proposalAction(ExchangeKnowledge_1.default),
            ],
            // [
            //   proposalAction(DeclareWarOnPlayer),
            //   // TODO: check that proposed `Player` is not currently at `War` with the mutual `Player`
            // ],
            [proposalAction(Terminate_1.default)],
        ],
    }, acceptDecline = [[resolutionAction(Accept_1.default)], [resolutionAction(Decline_1.default)]], diplomacyNegotiationMap = [
        [[null], [[proposalAction(Initiate_1.default)]]],
        [[Initiate_1.default], acceptDecline],
        [
            [Decline_1.default, lastInteractionWasResolutionForAction(Initiate_1.default)],
            [[proposalAction(Terminate_1.default)]],
        ],
        [
            [
                Accept_1.default,
                lastInteractionWasResolutionForAction(Initiate_1.default),
                new Criterion_1.default((negotiation) => !hasPeaceTreaty(...negotiation.players())),
            ],
            [[dialogueAction(Dialogue_1.default, 'welcome.no-peace')]],
        ],
        [
            [
                Accept_1.default,
                lastInteractionWasResolutionForAction(Initiate_1.default),
                new Criterion_1.default((negotiation) => hasPeaceTreaty(...negotiation.players())),
            ],
            [[dialogueAction(Dialogue_1.default, 'welcome.peace')]],
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
            [Dialogue_1.default, lastInteractionWasDialogueWithNamespace('welcome')],
            [[resolutionAction(Acknowledge_1.default)]],
        ],
        [
            [Acknowledge_1.default, lastInteractionWasResolutionForAction(Dialogue_1.default)],
            namedStateResults.standardTopics,
        ],
        [[OfferPeace_1.default], acceptDecline],
        [
            [Decline_1.default, lastInteractionWasResolutionForAction(OfferPeace_1.default)],
            [[dialogueAction(Dialogue_1.default, 'decline-peace.neutral')]],
        ],
        [
            [Accept_1.default, lastInteractionWasResolutionForAction(OfferPeace_1.default)],
            [[dialogueAction(Dialogue_1.default, 'accept-peace.neutral')]],
        ],
        [
            [Dialogue_1.default, lastInteractionWasDialogueWithNamespace('decline-peace')],
            [[resolutionAction(Acknowledge_1.default)]],
        ],
        [
            [Dialogue_1.default, lastInteractionWasDialogueWithNamespace('accept-peace')],
            [[resolutionAction(Acknowledge_1.default)]],
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
            [Dialogue_1.default, lastInteractionWasDialogueWithNamespace('decline-demand')],
            [[resolutionAction(Acknowledge_1.default)]],
        ],
        [
            [Dialogue_1.default, lastInteractionWasDialogueWithNamespace('accept-demand')],
            [[resolutionAction(Acknowledge_1.default)]],
        ],
        [[ExchangeKnowledge_1.default], acceptDecline],
        [
            [Decline_1.default, lastInteractionWasResolutionForAction(ExchangeKnowledge_1.default)],
            namedStateResults.standardTopics,
        ],
        [
            [Accept_1.default, lastInteractionWasResolutionForAction(ExchangeKnowledge_1.default)],
            namedStateResults.standardTopics,
        ],
    ];
    return [
        ...diplomacyNegotiationMap.flatMap(([[SourceInteractionType, ...additionalCriteria], validNextInteractions,]) => validNextInteractions.map(([...effectsAndCriteria]) => new Step_1.default(new Criterion_1.default((negotiation) => SourceInteractionType === null
            ? negotiation.lastInteraction() === null
            : negotiation.lastInteraction() instanceof
                SourceInteractionType), ...additionalCriteria, ...effectsAndCriteria))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=step.js.map