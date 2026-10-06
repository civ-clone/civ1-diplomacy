"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const AdvanceStolen_1 = require("@civ-clone/base-unit-action-steal-technology/AdvanceStolen");
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const getRules = (interactionRegistry = InteractionRegistry_1.instance) => [
    // A city can be robbed by a Diplomat once, until it changes hands (v474.05 clears its `TechnologyStolen` flag in
    //  `CityTakeover`, civ-clone/web-renderer#58).
    new Captured_1.default('civ1-diplomacy:city/captured/forget-thefts', new Effect_1.default((city) => interactionRegistry
        .entries()
        .filter((interaction) => interaction instanceof AdvanceStolen_1.default &&
        interaction.city() === city)
        .forEach((interaction) => interactionRegistry.unregister(interaction)))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map