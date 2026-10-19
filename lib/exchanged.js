"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.takenBy = exports.recordTaken = void 0;
// What each player took in an accepted exchange of knowledge, kept for the rest of the meeting so the computer player
//  can say what it took (civ-clone/web-renderer#453). Like the meeting itself, it isn't saved: a negotiation runs to
//  its end within the turn it starts in.
const exchanges = new WeakMap();
const recordTaken = (proposal, player, advance) => {
    var _a;
    const taken = (_a = exchanges.get(proposal)) !== null && _a !== void 0 ? _a : new Map();
    taken.set(player, advance);
    exchanges.set(proposal, taken);
};
exports.recordTaken = recordTaken;
const takenBy = (proposal, player) => { var _a, _b; return (_b = (_a = exchanges.get(proposal)) === null || _a === void 0 ? void 0 : _a.get(player)) !== null && _b !== void 0 ? _b : null; };
exports.takenBy = takenBy;
//# sourceMappingURL=exchanged.js.map