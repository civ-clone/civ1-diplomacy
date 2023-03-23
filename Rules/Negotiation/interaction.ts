import {
  instance as interactionRegistryInstance,
  InteractionRegistry,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import Interaction from '@civ-clone/core-diplomacy/Rules/Negotiation/Interaction';

export const getRules = (
  interactionRegistry: InteractionRegistry = interactionRegistryInstance
) => [
  new Interaction(
    new Effect((interaction) => interactionRegistry.register(interaction))
  ),
];

export default getRules;
