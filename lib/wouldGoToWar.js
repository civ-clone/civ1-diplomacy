"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wouldGoToWar = void 0;
const standing_1 = require("./standing");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
const div = (value, by) => Math.trunc(value / by);
// Whether computer player `player` would go to war with computer player `other` when they meet: v474.05's test
//  between two computer players (OpenCivOne `Segment_2517.cs` `F0_2517_0b1d`). They don't parley as a computer player
//  and the human do; the game decides it. `player` holds back:
// - while it is at war with a human player and `other` is weaker than that player, or the other way round (it won't
//  weaken a fellow enemy of the human);
// - while `other` has more nuclear weapons;
// - where it has cities that couldn't stand up to `other`'s attack there.
// Otherwise it fights if its attack, where both have units, outweighs `other`'s defence and half its attack there by
//  enough: four times the ratio must reach 4, plus one for each war it already has, one for a treaty it would break,
//  and its leader's Mood taken off. And it fights anyway if it has no cities where they both have units.
const wouldGoToWar = (dependencies, player, other) => {
    const humans = dependencies.playerRegistry
        .entries()
        .filter((human) => (0, isHuman_1.default)(human, dependencies.clientRegistry));
    if (humans.some((human) => ((0, standing_1.atWar)(dependencies, player, human) &&
        (0, standing_1.power)(dependencies, other) < (0, standing_1.power)(dependencies, human)) ||
        ((0, standing_1.atWar)(dependencies, other, human) &&
            (0, standing_1.power)(dependencies, player) < (0, standing_1.power)(dependencies, human)))) {
        return false;
    }
    if ((0, standing_1.nukes)(dependencies, player) < (0, standing_1.nukes)(dependencies, other)) {
        return false;
    }
    const wars = dependencies.playerRegistry
        .entries()
        .filter((third) => third !== other && (0, standing_1.atWar)(dependencies, player, third)).length, reluctance = wars +
        ((0, standing_1.atPeace)(dependencies, player, other) ? 1 : 0) -
        (0, standing_1.mood)(dependencies, player), presences = (0, standing_1.presence)(dependencies, player, other), ours = presences.get(player), theirs = presences.get(other);
    let ourAttack = 0, theirStrength = 1, citiesContested = 0;
    for (const landMass of (0, standing_1.landMassesOf)(ours, theirs)) {
        const us = (0, standing_1.presenceOn)(ours, landMass), them = (0, standing_1.presenceOn)(theirs, landMass);
        if (us.cities !== 0 && div(us.attack, 2) + us.defence < them.attack) {
            return false;
        }
        if (us.attack !== 0 && them.defence !== 0) {
            ourAttack += us.attack;
            theirStrength += div(them.attack, 2) + them.defence;
            citiesContested += us.cities;
        }
    }
    if (div(ourAttack * 4, theirStrength) >= reluctance + 4) {
        return true;
    }
    return citiesContested === 0;
};
exports.wouldGoToWar = wouldGoToWar;
exports.default = exports.wouldGoToWar;
//# sourceMappingURL=wouldGoToWar.js.map