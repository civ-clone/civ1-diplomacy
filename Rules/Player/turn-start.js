"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const ShamPeace_1 = require("@civ-clone/library-diplomacy/Declarations/ShamPeace");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const declareWar_1 = require("../../lib/declareWar");
// A computer player keeping a peace it means to break drops it, without a word, one turn in three (OpenCivOne
//  `Segment_2517.cs` ~L120-135: flag 0x100 becomes 0x200, and its next attack is a sneak attack).
const getRules = (dependencies, random) => [
    new TurnStart_1.default('civ1-diplomacy:player/turn-start/drop-sham-peace', new Effect_1.default((player) => dependencies.interactionRegistry
        .getByPlayer(player)
        .filter((interaction) => interaction instanceof ShamPeace_1.default &&
        interaction.active() &&
        interaction.holder() === player)
        .forEach((sham) => {
        const treaties = (0, declareWar_1.activeDeclarations)(dependencies, Peace_1.default, sham.holder(), sham.against());
        if (treaties.length > 0 && random() >= 1 / 3) {
            return;
        }
        // The treaty goes first, while the sham still marks it as one to end quietly (`Rules/Declaration/expired`).
        treaties.forEach((peace) => peace.expire(sham.holder()));
        sham.expire(sham.holder());
    }))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=turn-start.js.map