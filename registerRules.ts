import { instance as ruleRegistryInstance } from '@civ-clone/core-rule/RuleRegistry';
import declarationExpired from './Rules/Declaration/expired';
import negotiationInteraction from './Rules/Negotiation/interaction';
import negotiationStep from './Rules/Negotiation/step';
import proposalResolved from './Rules/Proposal/resolved';
import unitMoved from './Rules/Unit/moved';

ruleRegistryInstance.register(
  ...declarationExpired(),
  ...negotiationInteraction(),
  ...negotiationStep(),
  ...proposalResolved(),
  ...unitMoved()
);
