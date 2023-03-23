"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const interaction_1 = require("./Rules/Negotiation/interaction");
const step_1 = require("./Rules/Negotiation/step");
const resolved_1 = require("./Rules/Proposal/resolved");
const moved_1 = require("./Rules/Unit/moved");
RuleRegistry_1.instance.register(...(0, interaction_1.default)(), ...(0, step_1.default)(), ...(0, resolved_1.default)(), ...(0, moved_1.default)());
//# sourceMappingURL=registerRules.js.map