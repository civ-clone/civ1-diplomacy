"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const captured_1 = require("./Rules/City/captured");
const expired_1 = require("./Rules/Declaration/expired");
const interaction_1 = require("./Rules/Negotiation/interaction");
const step_1 = require("./Rules/Negotiation/step");
const resolved_1 = require("./Rules/Proposal/resolved");
const moved_1 = require("./Rules/Unit/moved");
const core_game_1 = require("@civ-clone/core-game");
const register = (game) => game.rules.register(...(0, captured_1.default)(game.interactions), ...(0, expired_1.default)(game.engine), ...(0, interaction_1.default)(game.interactions), ...(0, step_1.default)(game.rules, game.interactions, game.playerResearch), ...(0, resolved_1.default)(game.rules, game.interactions, game.playerResearch, game.clients), ...(0, moved_1.default)(game.interactions, game.units));
exports.register = register;
// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map