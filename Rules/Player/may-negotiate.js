"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const MayNegotiate_1 = require("@civ-clone/library-diplomacy/Rules/Player/MayNegotiate");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
const mayNegotiate_1 = require("@civ-clone/library-diplomacy/lib/mayNegotiate");
// How often players meet in v474.05:
// - a computer player and the human, 16 turns after they last met, or 32 after a treaty was signed (OpenCivOne
//  `Segment_2517.cs` L760-790 against `ContactPlayerCountdown`, which signing a treaty sets 16 turns ahead);
// - two computer players at first contact, then about one turn in four while their units are next to each other
//  (`(p1 + p2 + turn) & 3`, L810-819).
const getRules = (dependencies) => {
    const humanInvolved = (player, other) => (0, isHuman_1.default)(player, dependencies.clientRegistry) ||
        (0, isHuman_1.default)(other, dependencies.clientRegistry);
    return [
        // Barbarians can't be talked to (civ-clone/web-renderer#169). A rule that answers no, rather than a criterion on
        //  the two below: with no rule applying, `mayNegotiate` falls back to its default spacing and says yes.
        new MayNegotiate_1.default('civ1-diplomacy:player/may-negotiate/not-the-barbarians', new Criterion_1.default((player, other) => (0, isBarbarian_1.default)(player) || (0, isBarbarian_1.default)(other)), new Effect_1.default(() => false)),
        new MayNegotiate_1.default('civ1-diplomacy:player/may-negotiate/with-the-human', new Criterion_1.default(humanInvolved), new Effect_1.default((player, other) => {
            const last = (0, mayNegotiate_1.lastNegotiated)(player, other, dependencies.interactionRegistry);
            if (last === null) {
                return true;
            }
            const treatySince = dependencies.interactionRegistry
                .getByPlayers(player, other)
                .some((interaction) => interaction instanceof Peace_1.default && interaction.when() >= last);
            return dependencies.turn.value() - last >= (treatySince ? 32 : 16);
        })),
        new MayNegotiate_1.default('civ1-diplomacy:player/may-negotiate/computer-players', new Criterion_1.default((player, other) => !humanInvolved(player, other)), new Effect_1.default((player, other) => {
            const last = (0, mayNegotiate_1.lastNegotiated)(player, other, dependencies.interactionRegistry);
            return last === null || dependencies.turn.value() - last >= 4;
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=may-negotiate.js.map