"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const contact_1 = require("@civ-clone/base-diplomacy/lib/contact");
const getRules = (interactionRegistry = InteractionRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => {
    const { canMakeContact, besideAnother, makeContact } = (0, contact_1.default)(interactionRegistry, unitRegistry);
    return [
        new Moved_1.default(
        // Barbarians make contact with no one (civ-clone/web-renderer#169).
        new Criterion_1.default(canMakeContact), new Criterion_1.default(besideAnother), new Effect_1.default(makeContact)),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map