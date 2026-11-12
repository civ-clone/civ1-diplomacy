"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readers = void 0;
const standing_1 = require("./standing");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
const level_1 = require("@civ-clone/civ1-difficulty/level");
// What `base-diplomacy` reads about Civilization's content: the human, Nuclear units, Aggressive and Friendly leaders,
//  the Republic's and Democracy's Senate, and the difficulty level.
const readers = (dependencies) => ({
    isHuman: (player) => (0, isHuman_1.default)(player, dependencies.clientRegistry),
    nuclear: (player) => (0, standing_1.nukes)(dependencies, player),
    mood: (player) => (0, standing_1.mood)(dependencies, player),
    hasSenate: (player) => (0, standing_1.republican)(dependencies, player),
    level: () => (0, level_1.levelOf)(dependencies.gameDifficultyRegistry),
});
exports.readers = readers;
exports.default = exports.readers;
//# sourceMappingURL=readers.js.map