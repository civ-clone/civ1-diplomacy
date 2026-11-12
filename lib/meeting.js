"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingFor = exports.knownMeeting = void 0;
const meeting_1 = require("@civ-clone/base-diplomacy/lib/meeting");
const Governments_1 = require("@civ-clone/civ1-government/Governments");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
const standing_1 = require("./standing");
const stance_1 = require("./stance");
const wouldGoToWar_1 = require("./wouldGoToWar");
var meeting_2 = require("@civ-clone/base-diplomacy/lib/meeting");
Object.defineProperty(exports, "knownMeeting", { enumerable: true, get: function () { return meeting_2.knownMeeting; } });
// The computer pair's decision (OpenCivOne `Segment_2517.cs` `F0_2517_0737`, L821-1000): war if either would go to
//  war with the other (neither with the owner of the Great Wall, nor from a Republic or Democracy), otherwise peace.
//  v474.05 swaps an advance each way at every peaceful meeting, treaty or not (`F0_2517_0cef`). A Republic or
//  Democracy that can't win its Senate over becomes a Monarchy.
const rulesFor = (dependencies) => ({
    isHuman: (player) => (0, isHuman_1.default)(player, dependencies.clientRegistry),
    hasSenate: (player) => (0, standing_1.republican)(dependencies, player),
    wouldGoToWar: (player, other) => (0, wouldGoToWar_1.default)(dependencies, player, other),
    stance: (player, other, random, changeGovernment) => (0, stance_1.default)(dependencies, player, other, random, changeGovernment),
    changeGovernment: (republic) => {
        try {
            dependencies.playerGovernmentRegistry
                .getByPlayer(republic)
                .set(new Governments_1.Monarchy());
        }
        catch (e) {
            // A player with no government to change keeps none.
        }
    },
});
// Made once for each set of dependencies: a meeting is asked for at every step.
const rulesByDependencies = new WeakMap();
const meetingRules = (dependencies) => {
    if (!rulesByDependencies.has(dependencies)) {
        rulesByDependencies.set(dependencies, rulesFor(dependencies));
    }
    return rulesByDependencies.get(dependencies);
};
// The meeting for `negotiation`, worked out the first time it's asked for: that is when the coin is tossed and a
//  Republic may become a Monarchy.
const meetingFor = (dependencies, negotiation, random) => (0, meeting_1.meetingFor)(dependencies, meetingRules(dependencies), negotiation, random);
exports.meetingFor = meetingFor;
exports.default = exports.meetingFor;
//# sourceMappingURL=meeting.js.map