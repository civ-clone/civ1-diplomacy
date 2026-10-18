"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Detonated_1 = require("@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const High_1 = require("@civ-clone/core-rule/Priorities/High");
const Never_1 = require("@civ-clone/core-diplomacy/Expiries/Never");
const Vendetta_1 = require("@civ-clone/library-diplomacy/Declarations/Vendetta");
const holds_1 = require("@civ-clone/library-diplomacy/lib/holds");
// Everyone with a unit or a city under a nuclear strike holds it against the player who launched it (v474.05's
//  Vendetta flag, OpenCivOne `Segment_29f3.cs` ~L1417). Early, while the victims are still there to be found.
const getRules = (dependencies) => [
    new Detonated_1.default('civ1-diplomacy:unit/detonated/vendetta', new High_1.default(), new Effect_1.default((unit, tile) => {
        const attacker = unit.player(), area = [tile, ...tile.getNeighbours()], victims = new Set([
            ...area.flatMap((areaTile) => dependencies.unitRegistry
                .getByTile(areaTile)
                .map((victim) => victim.player())),
            ...area
                .map((areaTile) => dependencies.cityRegistry.getByTile(areaTile))
                .filter((city) => city !== null)
                .map((city) => city.player()),
        ]);
        victims.delete(attacker);
        victims.forEach((victim) => {
            if (!(0, holds_1.hasVendetta)(victim, attacker, dependencies.interactionRegistry)) {
                dependencies.interactionRegistry.register(new Vendetta_1.default(victim, attacker, new Never_1.default(), dependencies.ruleRegistry));
            }
        });
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=detonated.js.map