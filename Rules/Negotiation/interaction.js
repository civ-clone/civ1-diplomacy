"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Interaction_1 = require("@civ-clone/core-diplomacy/Rules/Negotiation/Interaction");
const getRules = (interactionRegistry = InteractionRegistry_1.instance) => [
    new Interaction_1.default(new Effect_1.default((interaction) => interactionRegistry.register(interaction))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=interaction.js.map