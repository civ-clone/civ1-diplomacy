"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const declareWar_1 = require("../../lib/declareWar");
const Accept_1 = require("@civ-clone/core-diplomacy/Proposal/Accept");
const Acknowledge_1 = require("@civ-clone/core-diplomacy/Proposal/Acknowledge");
const CancelTreaty_1 = require("@civ-clone/library-diplomacy/Proposals/CancelTreaty");
const ChoiceMeta_1 = require("@civ-clone/core-client/ChoiceMeta");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const DemandTribute_1 = require("@civ-clone/library-diplomacy/Proposals/DemandTribute");
const Dialogue_1 = require("@civ-clone/core-diplomacy/Negotiation/Dialogue");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ExchangeKnowledge_1 = require("@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge");
const Gold_1 = require("@civ-clone/base-city-yield-gold/Gold");
const OfferPeace_1 = require("@civ-clone/library-diplomacy/Proposals/OfferPeace");
const OfferPeaceWithGift_1 = require("@civ-clone/library-diplomacy/Proposals/OfferPeaceWithGift");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const Resolved_1 = require("@civ-clone/core-diplomacy/Rules/Proposal/Resolved");
const Vendetta_1 = require("@civ-clone/library-diplomacy/Declarations/Vendetta");
const Never_1 = require("@civ-clone/core-diplomacy/Expiries/Never");
const declareWar_2 = require("../../lib/declareWar");
const meeting_1 = require("../../lib/meeting");
const exchanged_1 = require("../../lib/exchanged");
const negotiationOf = (proposal) => proposal.negotiation();
// What each answer in a meeting does (`Rules/Negotiation/step`).
const getRules = (dependencies, random) => {
    const { clientRegistry, playerResearchRegistry, playerTreasuryRegistry, ruleRegistry, } = dependencies, 
    // Whatever the other player gives the computer player calms it: it's no longer hostile.
    calm = (proposal) => {
        const meeting = (0, meeting_1.knownMeeting)(negotiationOf(proposal));
        if (meeting !== null && proposal.by() === meeting.player) {
            meeting.stance.hostile = false;
        }
    }, give = (gift, from, to) => {
        if (gift instanceof Gold_1.default) {
            playerTreasuryRegistry
                .getByPlayerAndType(from, Gold_1.default)
                .subtract(gift.value());
            playerTreasuryRegistry.getByPlayerAndType(to, Gold_1.default).add(gift.value());
            return;
        }
        playerResearchRegistry.getByPlayer(to).addAdvance(gift.sourceClass());
    }, accepted = (ProposalType) => new Criterion_1.default((resolution, proposal) => resolution instanceof Accept_1.default && proposal instanceof ProposalType), acknowledged = (...keys) => new Criterion_1.default((resolution, proposal) => resolution instanceof Acknowledge_1.default &&
        proposal instanceof Dialogue_1.default &&
        keys.some((key) => proposal.key() === key || proposal.key().startsWith(`${key}.`))), advancesLacked = (from, by) => {
        const byResearch = playerResearchRegistry.getByPlayer(by);
        return playerResearchRegistry
            .getByPlayer(from)
            .complete()
            .filter((advance) => {
            const AdvanceType = advance.sourceClass();
            return !AdvanceType.repeatable && !byResearch.completed(AdvanceType);
        });
    };
    return [
        new Resolved_1.default('civ1-diplomacy:proposal/resolved/peace', accepted(OfferPeace_1.default), new Effect_1.default(async (resolution, proposal) => {
            if (proposal instanceof OfferPeaceWithGift_1.default) {
                proposal
                    .gifts()
                    .forEach((gift) => give(gift, proposal.by(), resolution.by()));
            }
            (0, declareWar_1.makePeace)(dependencies, proposal.by(), resolution.by());
        })),
        new Resolved_1.default('civ1-diplomacy:proposal/resolved/tribute', accepted(DemandTribute_1.default), new Effect_1.default(async (resolution, proposal) => {
            give(proposal.tribute(), resolution.by(), proposal.by());
            calm(proposal);
        })),
        // The other player cancels its treaty with the computer player's enemy, who won't forget it. Half the time the
        //  computer player then waives its tribute (L853-930).
        new Resolved_1.default('civ1-diplomacy:proposal/resolved/cancel-treaty', accepted(CancelTreaty_1.default), new Effect_1.default(async (resolution, proposal) => {
            const enemy = proposal.with(), meeting = (0, meeting_1.knownMeeting)(negotiationOf(proposal));
            (0, declareWar_2.activeDeclarations)(dependencies, Peace_1.default, resolution.by(), enemy).forEach((peace) => peace.expire(resolution.by()));
            dependencies.interactionRegistry.register(new Vendetta_1.default(enemy, resolution.by(), new Never_1.default(), ruleRegistry));
            calm(proposal);
            if (meeting !== null && random() < 0.5) {
                meeting.stance.tribute = 0;
            }
        })),
        new Resolved_1.default('civ1-diplomacy:proposal/resolved/exchange-knowledge', accepted(ExchangeKnowledge_1.default), new Effect_1.default(async (resolution, proposal) => {
            // `resolution.by()` agreed to the exchange; each side picks what it takes.
            const [by, other] = [resolution.by(), resolution.for()[0]], choose = (player, from) => clientRegistry.getByPlayer(player).chooseFromList(new ChoiceMeta_1.default(advancesLacked(from, player).map((advance) => advance.sourceClass()), 'diplomacy.exchange-knowledge', resolution)), byAdvance = await choose(by, other), otherAdvance = await choose(other, by);
            playerResearchRegistry.getByPlayer(by).addAdvance(byAdvance);
            playerResearchRegistry.getByPlayer(other).addAdvance(otherAdvance);
            (0, exchanged_1.recordTaken)(proposal, by, byAdvance);
            (0, exchanged_1.recordTaken)(proposal, other, otherAdvance);
            calm(proposal);
        })),
        new Resolved_1.default('civ1-diplomacy:proposal/resolved/declare-war', acknowledged('declare-war', 'computer.war'), new Effect_1.default(async (resolution, proposal) => (0, declareWar_1.declareWar)(dependencies, proposal.by(), resolution.by()))),
        // Two computer players make peace, each giving the other an advance first if both have one to give
        //  (`Segment_2517.cs` `F0_2517_0cef`).
        new Resolved_1.default('civ1-diplomacy:proposal/resolved/computer-peace', acknowledged('computer.peace'), new Effect_1.default(async (resolution, proposal) => {
            const [player, other] = [proposal.by(), resolution.by()], theirs = advancesLacked(other, player), ours = advancesLacked(player, other);
            if (theirs.length > 0 && ours.length > 0) {
                give(theirs[theirs.length - 1], other, player);
                give(ours[ours.length - 1], player, other);
            }
            (0, declareWar_1.makePeace)(dependencies, player, other);
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=resolved.js.map