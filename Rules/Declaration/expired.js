"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Expired_1 = require("@civ-clone/core-diplomacy/Rules/Declaration/Expired");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const ShamPeace_1 = require("@civ-clone/library-diplomacy/Declarations/ShamPeace");
const getRules = (engine = Engine_1.instance, interactionRegistry = InteractionRegistry_1.instance) => [
    new Expired_1.default('civ1-diplomacy:declaration/expired/announce', 
    // A peace dropped by a player that only pretended to keep it ends unannounced (`Rules/Player/turn-start`), as
    //  does the pretence itself.
    new Criterion_1.default((declaration) => !(declaration instanceof ShamPeace_1.default) &&
        !(declaration instanceof Peace_1.default &&
            interactionRegistry
                .getByPlayers(...declaration.players())
                .some((interaction) => interaction instanceof ShamPeace_1.default && interaction.active()))), new Effect_1.default((declaration) => {
        engine.emit('diplomacy:declaration-expired', declaration);
        declaration
            .players()
            .forEach((player) => engine.emit('player:declaration-expired', player, declaration));
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=expired.js.map