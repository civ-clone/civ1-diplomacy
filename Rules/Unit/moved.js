"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const InteractionRegistry_1 = require("@civ-clone/core-diplomacy/InteractionRegistry");
const UnitRegistry_1 = require("@civ-clone/core-unit/UnitRegistry");
const Interactions_1 = require("../../Interactions");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Moved_1 = require("@civ-clone/core-unit/Rules/Moved");
const getRules = (interactionRegistry = InteractionRegistry_1.instance, unitRegistry = UnitRegistry_1.instance) => {
    // The players each player has a `Contact` with, filled in from the registry the first time a pair is asked about.
    const met = new WeakMap(), metOf = (player) => {
        if (!met.has(player)) {
            met.set(player, new WeakSet());
        }
        return met.get(player);
    }, 
    // Whether the two have a `Contact` already: one is all "having met" needs (`lib/standing`). A unit moving back and
    //  forth beside another player's added one with every step, and a late game held tens of thousands of them, each
    //  slowing every search of the registry (civ-clone/web-renderer#377).
    inContact = (player, other) => {
        if (metOf(player).has(other)) {
            return true;
        }
        const found = interactionRegistry
            .getByPlayers(player, other)
            .some((interaction) => interaction instanceof Interactions_1.Contact);
        if (found) {
            metOf(player).add(other);
            metOf(other).add(player);
        }
        return found;
    };
    return [
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
            .forEach((tileUnit) => {
            if (inContact(unit.player(), tileUnit.player())) {
                return;
            }
            interactionRegistry.register(new Interactions_1.Contact(unit, tileUnit));
            metOf(unit.player()).add(tileUnit.player());
            metOf(tileUnit.player()).add(unit.player());
        })))),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=moved.js.map