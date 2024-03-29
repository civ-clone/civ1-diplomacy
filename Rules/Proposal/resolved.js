"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const Accept_1 = require("@civ-clone/core-diplomacy/Proposal/Accept");
const ChoiceMeta_1 = require("@civ-clone/core-client/ChoiceMeta");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Decline_1 = require("@civ-clone/core-diplomacy/Proposal/Decline");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ExchangeKnowledge_1 = require("@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge");
const Initiate_1 = require("@civ-clone/core-diplomacy/Negotiation/Initiate");
const Never_1 = require("@civ-clone/core-diplomacy/Expiries/Never");
const OfferPeace_1 = require("@civ-clone/library-diplomacy/Proposals/OfferPeace");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const Resolved_1 = require("@civ-clone/core-diplomacy/Rules/Proposal/Resolved");
const Terminate_1 = require("@civ-clone/core-diplomacy/Negotiation/Terminate");
const getRules = (ruleRegistry = RuleRegistry_1.instance, interactionRegistry = InteractionRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, clientRegistry = ClientRegistry_1.instance) => [
    new Resolved_1.default(new Criterion_1.default((resolution, proposal) => resolution instanceof Decline_1.default && proposal instanceof Initiate_1.default), new Effect_1.default(async (resolution, proposal) => proposal
        .negotiation()
        .proceed(new Terminate_1.default(resolution.by(), proposal.negotiation(), ruleRegistry)))),
    new Resolved_1.default(new Criterion_1.default((resolution, proposal) => resolution instanceof Accept_1.default && proposal instanceof OfferPeace_1.default), new Effect_1.default(async (resolution, proposal) => interactionRegistry.register(new Peace_1.default(...proposal.players(), new Never_1.default(), ruleRegistry)))),
    new Resolved_1.default(new Criterion_1.default((resolution, proposal) => resolution instanceof Accept_1.default && proposal instanceof ExchangeKnowledge_1.default), new Effect_1.default(async (resolution, proposal) => {
        // resolution.by() is the person that agreed to the exchange
        const byResearch = playerResearchRegistry.getByPlayer(resolution.by()), forResearch = playerResearchRegistry.getByPlayer(resolution.for()[0]), forAdvances = byResearch
            .complete()
            .filter((completedAdvance) => !forResearch.completed(completedAdvance.sourceClass())), byAdvances = forResearch
            .complete()
            .filter((completedAdvance) => !byResearch.completed(completedAdvance.sourceClass()));
        const byClient = clientRegistry.getByPlayer(resolution.by()), byAdvance = await byClient.chooseFromList(new ChoiceMeta_1.default(byAdvances.map((advance) => advance.sourceClass()), 'diplomacy.exchange-knowledge', resolution)), forClient = clientRegistry.getByPlayer(resolution.for()[0]), forAdvance = await forClient.chooseFromList(new ChoiceMeta_1.default(forAdvances.map((advance) => advance.sourceClass()), 'diplomacy.exchange-knowledge', resolution));
        byResearch.addAdvance(byAdvance);
        forResearch.addAdvance(forAdvance);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=resolved.js.map