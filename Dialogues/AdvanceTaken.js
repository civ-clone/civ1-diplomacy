"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvanceTaken = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Dialogue_1 = require("@civ-clone/core-diplomacy/Negotiation/Dialogue");
// The computer player says which advance it took in an exchange of knowledge (civ-clone/web-renderer#453).
class AdvanceTaken extends Dialogue_1.default {
    constructor(by, advance, negotiation, ruleRegistry = RuleRegistry_1.instance) {
        super(by, 'exchange-knowledge.taken', negotiation, ruleRegistry);
        this._advance = advance;
        this.addKey('advance');
    }
    advance() {
        return this._advance;
    }
}
exports.AdvanceTaken = AdvanceTaken;
exports.default = AdvanceTaken;
//# sourceMappingURL=AdvanceTaken.js.map