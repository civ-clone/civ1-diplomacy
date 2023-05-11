"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Expired_1 = require("@civ-clone/core-diplomacy/Rules/Declaration/Expired");
const getRules = (engine = Engine_1.instance) => [
    new Expired_1.default(new Effect_1.default((declaration) => {
        engine.emit('diplomacy:declaration-expired', declaration);
        declaration
            .players()
            .forEach((player) => engine.emit('player:declaration-expired', player, declaration));
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=expired.js.map