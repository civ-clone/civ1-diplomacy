"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const TurnStart_1 = require("@civ-clone/core-player/Rules/TurnStart");
const shamPeace_1 = require("@civ-clone/base-diplomacy/lib/shamPeace");
// A computer player keeping a peace it means to break drops it, without a word, one turn in three (OpenCivOne
//  `Segment_2517.cs` ~L120-135: flag 0x100 becomes 0x200, and its next attack is a sneak attack). The treaty goes
//  first, while the sham still marks it as one to end quietly (`Rules/Declaration/expired`).
const getRules = (dependencies, random) => [
    new TurnStart_1.default('civ1-diplomacy:player/turn-start/drop-sham-peace', new Effect_1.default((player) => (0, shamPeace_1.default)(dependencies, player, random, 1 / 3))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=turn-start.js.map