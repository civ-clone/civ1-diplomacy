"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wouldGoToWar = void 0;
const wouldGoToWar_1 = require("@civ-clone/base-diplomacy/lib/wouldGoToWar");
const readers_1 = require("./readers");
// Whether computer player `player` would go to war with computer player `other` when they meet: v474.05's test
//  between two computer players (OpenCivOne `Segment_2517.cs` `F0_2517_0b1d`), four times the ratio of attack to
//  strength reaching 4 plus its reluctance (`base-diplomacy`'s `wouldGoToWar`).
const wouldGoToWar = (dependencies, player, other) => (0, wouldGoToWar_1.wouldGoToWar)(dependencies, (0, readers_1.default)(dependencies), 4, player, other);
exports.wouldGoToWar = wouldGoToWar;
exports.default = exports.wouldGoToWar;
//# sourceMappingURL=wouldGoToWar.js.map