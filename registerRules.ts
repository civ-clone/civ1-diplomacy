import { instance as ruleRegistryInstance } from '@civ-clone/core-rule/RuleRegistry';
import unitMoved from './Rules/Unit/moved';

ruleRegistryInstance.register(...unitMoved());
