"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ranking = exports.republican = exports.mood = exports.nukes = exports.rankedFirst = exports.presenceOn = exports.presence = exports.power = exports.landMassesOf = exports.haveMet = exports.gold = exports.cityCount = exports.atWar = exports.atPeace = void 0;
const Traits_1 = require("@civ-clone/civ1-civilization/Traits");
const Governments_1 = require("@civ-clone/civ1-government/Governments");
const standing_1 = require("@civ-clone/base-diplomacy/lib/standing");
const Units_1 = require("@civ-clone/civ1-unit/Units");
var standing_2 = require("@civ-clone/base-diplomacy/lib/standing");
Object.defineProperty(exports, "atPeace", { enumerable: true, get: function () { return standing_2.atPeace; } });
Object.defineProperty(exports, "atWar", { enumerable: true, get: function () { return standing_2.atWar; } });
Object.defineProperty(exports, "cityCount", { enumerable: true, get: function () { return standing_2.cityCount; } });
Object.defineProperty(exports, "gold", { enumerable: true, get: function () { return standing_2.gold; } });
Object.defineProperty(exports, "haveMet", { enumerable: true, get: function () { return standing_2.haveMet; } });
Object.defineProperty(exports, "landMassesOf", { enumerable: true, get: function () { return standing_2.landMassesOf; } });
Object.defineProperty(exports, "power", { enumerable: true, get: function () { return standing_2.power; } });
Object.defineProperty(exports, "presence", { enumerable: true, get: function () { return standing_2.presence; } });
Object.defineProperty(exports, "presenceOn", { enumerable: true, get: function () { return standing_2.presenceOn; } });
Object.defineProperty(exports, "rankedFirst", { enumerable: true, get: function () { return standing_2.rankedFirst; } });
const nukes = (dependencies, player) => (0, standing_1.unitCount)(dependencies, player, (unit) => unit instanceof Units_1.Nuclear);
exports.nukes = nukes;
// The leader's Mood in v474.05 (`NationDefinition.cs`): 1 Aggressive, −1 Friendly, 0 otherwise.
const mood = (dependencies, player) => (0, standing_1.traitScore)(dependencies, player, (trait) => trait instanceof Traits_1.Aggressive ? 1 : trait instanceof Traits_1.Friendly ? -1 : 0);
exports.mood = mood;
const republican = (dependencies, player) => (0, standing_1.governedBy)(dependencies, player, Governments_1.Republic, Governments_1.Democracy);
exports.republican = republican;
// v474.05's `Ranking`: 7 for the highest score, then down by one, never below 0.
const ranking = (dependencies, player) => (0, standing_1.rankFromTop)(dependencies, player, 7);
exports.ranking = ranking;
//# sourceMappingURL=standing.js.map