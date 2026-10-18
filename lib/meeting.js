"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knownMeeting = exports.meetingFor = void 0;
const stance_1 = require("./stance");
const Governments_1 = require("@civ-clone/civ1-government/Governments");
const Negotiation_1 = require("@civ-clone/core-diplomacy/Negotiation");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
const standing_1 = require("./standing");
const wouldGoToWar_1 = require("./wouldGoToWar");
const isPacified_1 = require("@civ-clone/library-diplomacy/lib/isPacified");
const standing_2 = require("./standing");
const meetings = new WeakMap();
// The computer pair's decision (OpenCivOne `Segment_2517.cs` `F0_2517_0737`, L821-1000): war if either would go to
//  war with the other (neither with the owner of the Great Wall, nor from a Republic or Democracy), otherwise peace.
//  War between two at war already changes nothing.
const computerDecision = (dependencies, player, other, firstContact) => {
    const wants = (a, b) => (0, wouldGoToWar_1.default)(dependencies, a, b) &&
        !(0, isPacified_1.default)(a, b, dependencies.ruleRegistry) &&
        !(0, standing_2.republican)(dependencies, a);
    if (wants(player, other) || wants(other, player)) {
        return (0, standing_1.atPeace)(dependencies, player, other) || firstContact
            ? 'war'
            : 'nothing';
    }
    return (0, standing_1.atPeace)(dependencies, player, other) ? 'nothing' : 'peace';
};
// The meeting for `negotiation`, worked out the first time it's asked for: that is when the coin is tossed and a
//  Republic may become a Monarchy.
const meetingFor = (dependencies, negotiation, random) => {
    const known = meetings.get(negotiation);
    if (known !== undefined) {
        return known;
    }
    const [player, other] = negotiation.players(), firstContact = !dependencies.interactionRegistry
        .getByPlayers(player, other)
        .some((interaction) => interaction instanceof Negotiation_1.default && interaction !== negotiation), computer = !(0, isHuman_1.default)(player, dependencies.clientRegistry) &&
        !(0, isHuman_1.default)(other, dependencies.clientRegistry), meeting = {
        player,
        other,
        computer: computer
            ? computerDecision(dependencies, player, other, firstContact)
            : null,
        stance: (0, stance_1.stance)(dependencies, player, other, random, (republic) => {
            try {
                dependencies.playerGovernmentRegistry
                    .getByPlayer(republic)
                    .set(new Governments_1.Monarchy());
            }
            catch (e) {
                // A player with no government to change keeps none.
            }
        }),
        firstContact,
    };
    meetings.set(negotiation, meeting);
    return meeting;
};
exports.meetingFor = meetingFor;
// The meeting for `negotiation` if it's been worked out, without working it out.
const knownMeeting = (negotiation) => { var _a; return (_a = meetings.get(negotiation)) !== null && _a !== void 0 ? _a : null; };
exports.knownMeeting = knownMeeting;
exports.default = exports.meetingFor;
//# sourceMappingURL=meeting.js.map