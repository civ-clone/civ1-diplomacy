"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Interaction_1 = require("@civ-clone/core-diplomacy/Rules/Negotiation/Interaction");
const Never_1 = require("@civ-clone/core-diplomacy/Expiries/Never");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const ShamPeace_1 = require("@civ-clone/library-diplomacy/Declarations/ShamPeace");
const Terminate_1 = require("@civ-clone/core-diplomacy/Negotiation/Terminate");
const declareWar_1 = require("../../lib/declareWar");
const holds_1 = require("@civ-clone/library-diplomacy/lib/holds");
const meeting_1 = require("../../lib/meeting");
const getRules = (dependencies) => [
    new Interaction_1.default('civ1-diplomacy:negotiation/interaction/register', new Effect_1.default((interaction) => dependencies.interactionRegistry.register(interaction))),
    // A computer player that backed off from a treaty partner it wanted to threaten keeps the peace for now, and means
    //  to drop it (`MeetWithKing.cs` L644-660, flag 0x100).
    new Interaction_1.default('civ1-diplomacy:negotiation/interaction/sham-peace', new Effect_1.default((interaction, negotiation) => {
        const meeting = (0, meeting_1.knownMeeting)(negotiation);
        if (!(interaction instanceof Terminate_1.default) ||
            meeting === null ||
            !meeting.stance.sham ||
            (0, declareWar_1.activeDeclarations)(dependencies, Peace_1.default, meeting.player, meeting.other)
                .length === 0 ||
            (0, holds_1.heldBy)(ShamPeace_1.default, meeting.player, meeting.other, dependencies.interactionRegistry) !== null) {
            return;
        }
        dependencies.interactionRegistry.register(new ShamPeace_1.default(meeting.player, meeting.other, new Never_1.default(), dependencies.ruleRegistry));
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=interaction.js.map