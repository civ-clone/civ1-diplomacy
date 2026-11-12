"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.stepNumbers = void 0;
const meetingSteps_1 = require("@civ-clone/base-diplomacy/lib/meetingSteps");
const AdvanceTaken_1 = require("../../Dialogues/AdvanceTaken");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Step_1 = require("@civ-clone/core-diplomacy/Rules/Negotiation/Step");
const meeting_1 = require("../../lib/meeting");
const standing_1 = require("../../lib/standing");
const exchanged_1 = require("../../lib/exchanged");
// v474.05's numbers (OpenCivOne `MeetWithKing.cs`): knowledge is offered while the computer player knows six advances
//  or fewer, or isn't hostile (L664-822); v474.05 marks a demand made by setting the tribute to 999, so a tribute
//  above 50 provokes war at peace (L1036-1453); gold goes in fifties; a refused peace is sweetened with an advance at
//  fear 4, then with 2 × fear − 4 fifties (L1300-1453).
exports.stepNumbers = {
    openKnowledge: 6,
    provokingTribute: 50,
    goldUnit: 50,
    advanceGiftFear: 4,
    goldGift: (fear) => 2 * fear - 4,
};
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
// The answers on offer come in the order of `meetingSteps`' rows, the one that costs the answering player nothing first, so
//  a client taking the first takes the safe one (civ-clone/web-renderer#674): receiving the emissary, refusing a
//  demand, an exchange or a call to cancel a treaty, accepting peace, and leaving rather than demanding in turn.
//
// Nothing here changes the meeting: what has been said so far is read from the negotiation, so the steps can be
//  asked for as often as a client likes. The answers' effects are in `Rules/Proposal/resolved`.
const getRules = (dependencies, random) => (0, meetingSteps_1.meetingSteps)(dependencies, {
    meeting: (negotiation) => (0, meeting_1.meetingFor)(dependencies, negotiation, random),
    hasSenate: (player) => (0, standing_1.republican)(dependencies, player),
    advanceTaken: (player, advance, negotiation) => new AdvanceTaken_1.default(player, advance, negotiation, dependencies.ruleRegistry),
    takenBy: exchanged_1.takenBy,
}, exports.stepNumbers).map(([applies, next]) => new Step_1.default(new Criterion_1.default((negotiation) => applies(negotiation) && next(negotiation) !== null), new Effect_1.default((negotiation) => next(negotiation))));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=step.js.map