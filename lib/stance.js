"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stance = exports.stanceNumbers = void 0;
const stance_1 = require("@civ-clone/base-diplomacy/lib/stance");
const readers_1 = require("./readers");
// How a computer player comes to a meeting with another, as v474.05 works it out when its king meets the human's
//  (OpenCivOne `MeetWithKing.cs` `F6_0000_0000`, L75-660; civ-clone/web-renderer#427), with v474.05's numbers:
// - fear for cities it can't hold: the other's attack × 2, × 4 on Chieftain, over its defence + 1 (L75-231);
// - an ultimatum to the leader after turn 200, if it has more than four cities; at least 10 × `Ranking` (L234-279);
// - nuclear weapons: at least 100 demanded of a player without, fear 4 of a player with (L282-349);
// - the tribute × (level + 1) / 32, at most 20 fifties (L386-424).
exports.stanceNumbers = {
    fearWeight: (level) => (level === 0 ? 4 : 2),
    ultimatumTurn: 200,
    ultimatumCities: 4,
    topRanking: 7,
    nuclearTribute: 100,
    nuclearFear: 4,
    tributeDivisor: 32,
    tributeUnit: 50,
    tributeUnits: 20,
};
// `random` is asked for the one coin v474.05 tosses (whether a computer player that wants peace waives the tribute);
//  without it, nothing random happens and the tribute stands, so the result can be asked for at any time.
// `changeGovernment` is v474.05's other side effect: a hostile Republic or Democracy that can't win its Senate over
//  becomes a Monarchy. It is called only when the meeting itself asks.
const stance = (dependencies, player, other, random = null, changeGovernment = null) => (0, stance_1.stance)(dependencies, (0, readers_1.default)(dependencies), exports.stanceNumbers, player, other, random, changeGovernment);
exports.stance = stance;
exports.default = exports.stance;
//# sourceMappingURL=stance.js.map