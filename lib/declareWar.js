"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeDeclarations = exports.makePeace = exports.declareWar = void 0;
const Never_1 = require("@civ-clone/core-diplomacy/Expiries/Never");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const ShamPeace_1 = require("@civ-clone/library-diplomacy/Declarations/ShamPeace");
const War_1 = require("@civ-clone/base-diplomacy-declaration-war/War");
const active = (dependencies, 
// Not `typeof Declaration`: a subclass with members of its own isn't assignable to it (civ-clone/web-renderer#21).
DeclarationType, ...players) => dependencies.interactionRegistry
    .getByPlayers(...players)
    .filter((interaction) => interaction instanceof DeclarationType &&
    interaction.active());
// `player` goes to war with `other`: any treaty between them ends, and so does a peace either meant to drop.
const declareWar = (dependencies, player, other) => {
    active(dependencies, ShamPeace_1.default, player, other).forEach((sham) => sham.expire());
    active(dependencies, Peace_1.default, player, other).forEach((peace) => peace.expire());
    dependencies.interactionRegistry.register(new War_1.default(player, other, new Never_1.default(), dependencies.ruleRegistry));
};
exports.declareWar = declareWar;
// `player` and `other` make peace, unless they have already.
const makePeace = (dependencies, player, other) => {
    if (active(dependencies, Peace_1.default, player, other).length > 0) {
        return;
    }
    dependencies.interactionRegistry.register(new Peace_1.default(player, other, new Never_1.default(), dependencies.ruleRegistry));
};
exports.makePeace = makePeace;
exports.activeDeclarations = active;
exports.default = exports.declareWar;
//# sourceMappingURL=declareWar.js.map