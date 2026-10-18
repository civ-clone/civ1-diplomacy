"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.dependenciesOf = void 0;
const captured_1 = require("./Rules/City/captured");
const expired_1 = require("./Rules/Declaration/expired");
const interaction_1 = require("./Rules/Negotiation/interaction");
const step_1 = require("./Rules/Negotiation/step");
const may_negotiate_1 = require("./Rules/Player/may-negotiate");
const turn_start_1 = require("./Rules/Player/turn-start");
const resolved_1 = require("./Rules/Proposal/resolved");
const detonated_1 = require("./Rules/Unit/detonated");
const moved_1 = require("./Rules/Unit/moved");
const core_game_1 = require("@civ-clone/core-game");
const dependenciesOf = (game) => ({
    cityRegistry: game.cities,
    clientRegistry: game.clients,
    gameDifficultyRegistry: game.difficulty,
    interactionRegistry: game.interactions,
    landMassRegistry: game.landMasses,
    playerGovernmentRegistry: game.playerGovernments,
    playerRegistry: game.players,
    playerResearchRegistry: game.playerResearch,
    playerTreasuryRegistry: game.playerTreasuries,
    ruleRegistry: game.rules,
    traitRegistry: game.traits,
    turn: game.turn,
    unitRegistry: game.units,
});
exports.dependenciesOf = dependenciesOf;
const register = (game) => {
    const dependencies = (0, exports.dependenciesOf)(game);
    game.rules.register(...(0, captured_1.default)(game.interactions), ...(0, expired_1.default)(game.engine, game.interactions), ...(0, interaction_1.default)(dependencies), ...(0, step_1.default)(dependencies, game.rng), ...(0, may_negotiate_1.default)(dependencies), ...(0, turn_start_1.default)(dependencies, game.rng), ...(0, resolved_1.default)(dependencies, game.rng), ...(0, detonated_1.default)(dependencies), ...(0, moved_1.default)(game.interactions, game.units));
};
exports.register = register;
// The plugin loader imports each package for this side effect. Until it passes
// a `Game` of its own, dropping it would produce a game with silently absent
// rules — no error, just wrong behaviour.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map