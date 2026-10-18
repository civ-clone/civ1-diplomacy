"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankedFirst = exports.ranking = exports.republican = exports.mood = exports.atWar = exports.haveMet = exports.atPeace = exports.cityCount = exports.gold = exports.nukes = exports.power = exports.presenceOn = exports.landMassesOf = exports.presence = void 0;
const Traits_1 = require("@civ-clone/civ1-civilization/Traits");
const Governments_1 = require("@civ-clone/civ1-government/Governments");
const Contact_1 = require("@civ-clone/base-diplomacy-interaction-contact/Contact");
const Gold_1 = require("@civ-clone/base-city-yield-gold/Gold");
const Units_1 = require("@civ-clone/civ1-unit/Units");
const Negotiation_1 = require("@civ-clone/core-diplomacy/Negotiation");
const Peace_1 = require("@civ-clone/base-diplomacy-declaration-peace/Peace");
const leaderTraits_1 = require("@civ-clone/base-leader-personality/lib/leaderTraits");
const strength_1 = require("@civ-clone/core-power/lib/strength");
const rank_1 = require("@civ-clone/core-power/lib/rank");
const strength_2 = require("@civ-clone/core-power/lib/strength");
const empty = () => ({ attack: 0, defence: 0, cities: 0 });
// Each land tile's land mass, worked out once per call: `LandMassRegistry#getByTile` searches every land mass.
const landMassesByTile = (dependencies) => {
    const byTile = new Map();
    dependencies.landMassRegistry
        .entries()
        .forEach((landMass) => landMass.tiles().forEach((tile) => byTile.set(tile, landMass)));
    return byTile;
};
// Where `players` stand on each land mass. Units at sea are on no land mass, so they count only in `militaryPower`.
const presence = (dependencies, ...players) => {
    const byTile = landMassesByTile(dependencies), result = new Map();
    players.forEach((player) => {
        const byLandMass = new Map(), at = (tile) => {
            const landMass = byTile.get(tile);
            if (landMass === undefined) {
                return null;
            }
            if (!byLandMass.has(landMass)) {
                byLandMass.set(landMass, empty());
            }
            return byLandMass.get(landMass);
        };
        dependencies.unitRegistry.getByPlayer(player).forEach((unit) => {
            const here = at(unit.tile());
            if (here === null) {
                return;
            }
            const { attack, defence } = (0, strength_2.strength)(unit, dependencies.ruleRegistry);
            here.attack += attack;
            here.defence += defence;
        });
        dependencies.cityRegistry.getByPlayer(player).forEach((city) => {
            const here = at(city.tile());
            if (here !== null) {
                here.cities++;
            }
        });
        result.set(player, byLandMass);
    });
    return result;
};
exports.presence = presence;
// The land masses either player stands on.
const landMassesOf = (...presences) => Array.from(new Set(presences.flatMap((byLandMass) => Array.from(byLandMass.keys()))));
exports.landMassesOf = landMassesOf;
const presenceOn = (byLandMass, landMass) => { var _a; return (_a = byLandMass.get(landMass)) !== null && _a !== void 0 ? _a : empty(); };
exports.presenceOn = presenceOn;
// v474.05's `MilitaryPower`: every unit's attack and defence, wherever it is.
const power = (dependencies, player) => (0, strength_1.militaryPower)(dependencies.unitRegistry.getByPlayer(player), dependencies.ruleRegistry);
exports.power = power;
const nukes = (dependencies, player) => dependencies.unitRegistry
    .getByPlayer(player)
    .filter((unit) => unit instanceof Units_1.Nuclear).length;
exports.nukes = nukes;
const gold = (dependencies, player) => {
    try {
        return dependencies.playerTreasuryRegistry
            .getByPlayerAndType(player, Gold_1.default)
            .value();
    }
    catch (e) {
        return 0;
    }
};
exports.gold = gold;
const cityCount = (dependencies, player) => dependencies.cityRegistry.getByPlayer(player).length;
exports.cityCount = cityCount;
const atPeace = (dependencies, player, other) => dependencies.interactionRegistry
    .getByPlayers(player, other)
    .some((interaction) => interaction instanceof Peace_1.default && interaction.active());
exports.atPeace = atPeace;
// Whether the two have met: v474.05's `Contact` flag. Any interaction between them will do, a `Contact` or a
//  negotiation.
const haveMet = (dependencies, player, other) => dependencies.interactionRegistry
    .getByPlayers(player, other)
    .some((interaction) => interaction instanceof Contact_1.default || interaction instanceof Negotiation_1.default);
exports.haveMet = haveMet;
// v474.05 counts a civilization at war with another when they've met and have no peace treaty.
const atWar = (dependencies, player, other) => player !== other &&
    (0, exports.haveMet)(dependencies, player, other) &&
    !(0, exports.atPeace)(dependencies, player, other);
exports.atWar = atWar;
// The leader's Mood in v474.05 (`NationDefinition.cs`): 1 Aggressive, −1 Friendly, 0 otherwise.
const mood = (dependencies, player) => (0, leaderTraits_1.default)(dependencies.traitRegistry, player).reduce((total, trait) => total +
    (trait instanceof Traits_1.Aggressive ? 1 : trait instanceof Traits_1.Friendly ? -1 : 0), 0);
exports.mood = mood;
const republican = (dependencies, player) => {
    try {
        return dependencies.playerGovernmentRegistry
            .getByPlayer(player)
            .is(Governments_1.Republic, Governments_1.Democracy);
    }
    catch (e) {
        return false;
    }
};
exports.republican = republican;
// v474.05's `Ranking`: 7 for the highest score, then down by one, never below 0.
const ranking = (dependencies, player) => Math.max(0, 7 -
    (0, rank_1.rankings)(dependencies.playerRegistry.entries(), dependencies.ruleRegistry).indexOf(player));
exports.ranking = ranking;
const rankedFirst = (dependencies, player) => (0, rank_1.rankings)(dependencies.playerRegistry.entries(), dependencies.ruleRegistry)[0] === player;
exports.rankedFirst = rankedFirst;
//# sourceMappingURL=standing.js.map