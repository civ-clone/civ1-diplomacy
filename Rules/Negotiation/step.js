"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const standing_1 = require("../../lib/standing");
const Accept_1 = require("@civ-clone/core-diplomacy/Proposal/Accept");
const Acknowledge_1 = require("@civ-clone/core-diplomacy/Proposal/Acknowledge");
const AdvanceTaken_1 = require("../../Dialogues/AdvanceTaken");
const CancelTreaty_1 = require("@civ-clone/library-diplomacy/Proposals/CancelTreaty");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Decline_1 = require("@civ-clone/core-diplomacy/Proposal/Decline");
const DemandTribute_1 = require("@civ-clone/library-diplomacy/Proposals/DemandTribute");
const Dialogue_1 = require("@civ-clone/core-diplomacy/Negotiation/Dialogue");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const ExchangeKnowledge_1 = require("@civ-clone/library-diplomacy/Proposals/ExchangeKnowledge");
const Gold_1 = require("@civ-clone/base-city-yield-gold/Gold");
const Initiate_1 = require("@civ-clone/core-diplomacy/Negotiation/Initiate");
const OfferPeace_1 = require("@civ-clone/library-diplomacy/Proposals/OfferPeace");
const OfferPeaceWithGift_1 = require("@civ-clone/library-diplomacy/Proposals/OfferPeaceWithGift");
const Step_1 = require("@civ-clone/core-diplomacy/Rules/Negotiation/Step");
const Terminate_1 = require("@civ-clone/core-diplomacy/Negotiation/Terminate");
const holds_1 = require("@civ-clone/library-diplomacy/lib/holds");
const meeting_1 = require("../../lib/meeting");
const exchanged_1 = require("../../lib/exchanged");
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
const getRules = (dependencies, random) => {
    const { playerResearchRegistry, ruleRegistry } = dependencies, meeting = (negotiation) => (0, meeting_1.meetingFor)(dependencies, negotiation, random), last = (negotiation) => negotiation.lastInteraction(), said = (negotiation, ActionType, by, matches = () => true) => negotiation
        .interactions()
        .filter((action) => action instanceof ActionType &&
        action.by() === by &&
        matches(action)), answered = (negotiation, ResolutionType, ProposalType, matches = () => true) => negotiation
        .interactions()
        .some((action) => action instanceof ResolutionType &&
        action.proposal() instanceof ProposalType &&
        matches(action.proposal())), lastWas = (negotiation, ResolutionType, ...ProposalTypes) => {
        const action = last(negotiation);
        return (action instanceof ResolutionType &&
            ProposalTypes.some((ProposalType) => action.proposal() instanceof ProposalType));
    }, acknowledged = (negotiation, ...namespaces) => {
        const action = last(negotiation);
        return (action instanceof Acknowledge_1.default &&
            action.proposal() instanceof Dialogue_1.default &&
            namespaces.includes(action.proposal().key().split('.')[0]));
    }, 
    // Whether the last step was `player`'s dialogue `key`, still unanswered.
    justSaid = (negotiation, key) => {
        const action = last(negotiation);
        return action instanceof Dialogue_1.default && action.key() === key;
    }, advancesLacked = (from, by) => {
        const byResearch = playerResearchRegistry.getByPlayer(by);
        return playerResearchRegistry
            .getByPlayer(from)
            .complete()
            .filter((advance) => !byResearch.completed(advance.sourceClass()));
    }, known = (player) => playerResearchRegistry.getByPlayer(player).complete().length, goldDemanded = (tribute) => tribute.tribute() instanceof Gold_1.default, say = (negotiation, key) => new Dialogue_1.default(meeting(negotiation).player, key, negotiation, ruleRegistry), end = (negotiation, by) => new Terminate_1.default(by, negotiation, ruleRegistry), 
    // What the computer player says next, after its greeting and after each answer.
    nextTopic = (negotiation) => {
        const { player, other, stance } = meeting(negotiation), theirs = advancesLacked(other, player), ours = advancesLacked(player, other);
        // Knowledge (L664-822): while `player` knows six advances or fewer, or isn't hostile, and the other knows as
        //  many as it does, and each has something new for the other. Once turned down, not again.
        if (!answered(negotiation, Decline_1.default, ExchangeKnowledge_1.default) &&
            (known(player) <= 6 || !stance.hostile) &&
            known(other) >= known(player) &&
            theirs.length > 0 &&
            ours.length > 0) {
            // What it offers: what it knows and the other doesn't (civ-clone/web-renderer#453).
            return new ExchangeKnowledge_1.default(ours, player, negotiation, ruleRegistry);
        }
        // A call to cancel a treaty with `player`'s enemy (L853-930).
        if (said(negotiation, CancelTreaty_1.default, player).length === 0 &&
            stance.mode !== 0 &&
            stance.enemyAtPeaceWithOther !== null) {
            return new CancelTreaty_1.default(stance.enemyAtPeaceWithOther, player, negotiation, ruleRegistry);
        }
        const tributes = said(negotiation, DemandTribute_1.default, player);
        // Tribute (L933-985), which only a hostile player demands, and only of gold the other has.
        if (tributes.length === 0 &&
            stance.tribute !== 0 &&
            stance.mode === 2 &&
            (0, standing_1.gold)(dependencies, other) > stance.tribute) {
            return new DemandTribute_1.default(new Gold_1.default(stance.tribute), player, negotiation, ruleRegistry);
        }
        // Failing tribute, an advance (L988-1033): the most recent of the other's that `player` lacks.
        if (tributes.length === 0 && stance.mode !== 0 && theirs.length > 0) {
            return new DemandTribute_1.default(theirs[theirs.length - 1], player, negotiation, ruleRegistry);
        }
        return conclusion(negotiation);
    }, 
    // War or peace (L1036-1453).
    conclusion = (negotiation) => {
        const { firstContact, player, stance } = meeting(negotiation), demanded = said(negotiation, DemandTribute_1.default, player, goldDemanded).length > 0, refused = answered(negotiation, Decline_1.default, DemandTribute_1.default, (tribute) => tribute.by() === player && goldDemanded(tribute));
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
        return new OfferPeace_1.default(player, negotiation, ruleRegistry);
    }, 
    // A refused peace, sweetened (L1300-1453): an advance if `player` fears the other enough, then gold, then all it
    //  has if it's down to one city, and war once there's nothing left to offer.
    sweetener = (negotiation) => {
        const { player, other, stance } = meeting(negotiation), ours = advancesLacked(player, other), treasury = (0, standing_1.gold)(dependencies, player), offered = said(negotiation, OfferPeaceWithGift_1.default, player), tried = new Set(offered.map((offer) => offer.kind())), offer = (kind, gifts) => new OfferPeaceWithGift_1.default(kind, gifts, player, negotiation, ruleRegistry), steps = [
            [
                'advance',
                () => stance.fear >= 4 && ours.length > 0
                    ? [ours[ours.length - 1]]
                    : null,
            ],
            [
                'gold',
                () => {
                    const amount = Math.min(Math.max(2 * stance.fear - 4, 0), Math.trunc(treasury / 50)) * 50;
                    return amount > 0 ? [new Gold_1.default(amount)] : null;
                },
            ],
            [
                'everything',
                () => stance.fear !== 0 &&
                    (0, standing_1.cityCount)(dependencies, player) <= 1 &&
                    (ours.length > 0 || treasury > 0)
                    ? [...ours, ...(treasury > 0 ? [new Gold_1.default(treasury)] : [])]
                    : null,
            ],
        ];
        // Each is tried once, in order, after the one before it (whether offered or skipped).
        const lastTried = Math.max(-1, ...steps.map(([key], index) => (tried.has(key) ? index : -1)));
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
    handoverDemand = (negotiation) => {
        const { player, other, stance } = meeting(negotiation);
        if ((0, standing_1.republican)(dependencies, other)) {
            return null;
        }
        const amount = Math.min(Math.max(stance.fear, 0), Math.trunc((0, standing_1.gold)(dependencies, player) / 50)) * 50;
        return new DemandTribute_1.default(new Gold_1.default(amount), other, negotiation, ruleRegistry);
    }, theOtherDemanded = (negotiation) => {
        const action = last(negotiation);
        return action instanceof DemandTribute_1.default &&
            action.by() === meeting(negotiation).other
            ? action
            : null;
    }, proposedByComputer = (negotiation) => {
        const action = last(negotiation);
        return (action instanceof ExchangeKnowledge_1.default ||
            action instanceof CancelTreaty_1.default ||
            action instanceof OfferPeace_1.default ||
            action instanceof DemandTribute_1.default) &&
            action.by() === meeting(negotiation).player
            ? action
            : null;
    }, rows = [
        [
            (negotiation) => last(negotiation) === null,
            (negotiation) => new Initiate_1.default(negotiation.players()[0], negotiation, ruleRegistry),
        ],
        [
            (negotiation) => last(negotiation) instanceof Initiate_1.default,
            (negotiation) => new Accept_1.default(negotiation.players()[1], last(negotiation), ruleRegistry),
        ],
        [
            (negotiation) => last(negotiation) instanceof Initiate_1.default,
            (negotiation) => new Decline_1.default(negotiation.players()[1], last(negotiation), ruleRegistry),
        ],
        // Turning the emissary away doesn't stop a hostile computer player declaring war.
        [
            (negotiation) => lastWas(negotiation, Decline_1.default, Initiate_1.default),
            (negotiation) => {
                const { computer, player, stance } = meeting(negotiation);
                return computer === null && stance.hostile
                    ? conclusion(negotiation)
                    : end(negotiation, player);
            },
        ],
        [
            (negotiation) => lastWas(negotiation, Accept_1.default, Initiate_1.default),
            (negotiation) => {
                const { computer, other, player, stance } = meeting(negotiation);
                if (computer !== null) {
                    return say(negotiation, `computer.${computer}`);
                }
                if ((0, holds_1.hasVendetta)(player, other, dependencies.interactionRegistry)) {
                    return say(negotiation, 'welcome.vendetta');
                }
                return say(negotiation, stance.atPeace ? 'welcome.peace' : 'welcome.no-peace');
            },
        ],
        // Every dialogue is acknowledged by the player it's said to, but the hand-over: the other answers that with its
        //  reply, so "You respond..." is where it chooses one (civ-clone/web-renderer#454).
        [
            (negotiation) => last(negotiation) instanceof Dialogue_1.default &&
                !justSaid(negotiation, 'handover'),
            (negotiation) => new Acknowledge_1.default(meeting(negotiation).other, last(negotiation), ruleRegistry),
        ],
        [
            (negotiation) => acknowledged(negotiation, 'welcome', 'exchange-knowledge'),
            nextTopic,
        ],
        [
            (negotiation) => acknowledged(negotiation, 'computer', 'declare-war', 'farewell', 'accept-peace'),
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
            (negotiation) => new Accept_1.default(meeting(negotiation).other, last(negotiation), ruleRegistry),
        ],
        [
            (negotiation) => proposedByComputer(negotiation) !== null,
            (negotiation) => new Decline_1.default(meeting(negotiation).other, last(negotiation), ruleRegistry),
        ],
        [
            (negotiation) => lastWas(negotiation, Accept_1.default, OfferPeace_1.default),
            (negotiation) => say(negotiation, 'accept-peace.neutral'),
        ],
        [(negotiation) => lastWas(negotiation, Decline_1.default, OfferPeace_1.default), sweetener],
        [
            (negotiation) => lastWas(negotiation, Accept_1.default, ExchangeKnowledge_1.default, CancelTreaty_1.default, DemandTribute_1.default) ||
                lastWas(negotiation, Decline_1.default, ExchangeKnowledge_1.default, CancelTreaty_1.default, DemandTribute_1.default),
            (negotiation) => {
                const resolution = last(negotiation), { player } = meeting(negotiation), taken = resolution instanceof Accept_1.default &&
                    resolution.proposal() instanceof ExchangeKnowledge_1.default
                    ? (0, exchanged_1.takenBy)(resolution.proposal(), player)
                    : null;
                if (taken !== null) {
                    // It says what it took, then carries on (civ-clone/web-renderer#453).
                    return new AdvanceTaken_1.default(player, taken, negotiation, ruleRegistry);
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
                const demand = theOtherDemanded(negotiation), tribute = demand.tribute(), { player } = meeting(negotiation);
                return tribute instanceof Gold_1.default && tribute.value() > 0
                    ? new Accept_1.default(player, demand, ruleRegistry)
                    : new Decline_1.default(player, demand, ruleRegistry);
            },
        ],
    ];
    return rows.map(([applies, next]) => new Step_1.default(new Criterion_1.default((negotiation) => applies(negotiation) && next(negotiation) !== null), new Effect_1.default((negotiation) => next(negotiation))));
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=step.js.map