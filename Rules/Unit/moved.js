"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Interactions_1 = require("../../Interactions");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const getRules = (interactionRegistry = InteractionRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => [
    new Moved_1.default(new Criterion_1.default((unit) => unit
        .tile()
        .getNeighbours()
        .some((tile) => unitRegistry
        .getByTile(tile)
        .some((tileUnit) => tileUnit.player() !== unit.player()))), new Effect_1.default((unit) => unit
        .tile()
        .getNeighbours()
        .forEach((tile) => unitRegistry
        .getByTile(tile)
        .filter((tileUnit) => tileUnit.player() !== unit.player())
        .forEach((tileUnit) => interactionRegistry.register(new Interactions_1.Contact(unit, tileUnit)))))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map