import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import AdvanceStolen from '@civ-clone/base-unit-action-steal-technology/AdvanceStolen';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';

export const getRules: (
  interactionRegistry?: InteractionRegistry
) => Captured[] = (
  interactionRegistry: InteractionRegistry = interactionRegistryInstance
): Captured[] => [
  // A city can be robbed by a Diplomat once, until it changes hands (v474.05 clears its `TechnologyStolen` flag in
  //  `CityTakeover`, civ-clone/web-renderer#58).
  new Captured(
    'civ1-diplomacy:city/captured/forget-thefts',
    new Effect((city: City): void =>
      interactionRegistry
        .entries()
        .filter(
          (interaction) =>
            interaction instanceof AdvanceStolen &&
            (interaction as unknown as AdvanceStolen).city() === city
        )
        .forEach((interaction) => interactionRegistry.unregister(interaction))
    )
  ),
];

export default getRules;
