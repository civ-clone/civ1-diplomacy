import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import {
  UnitRegistry,
  instance as unitRegistryInstance,
} from '@civ-clone/core-unit/UnitRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import contactOnMove from '@civ-clone/base-diplomacy/lib/contact';

export const getRules: (
  interactionRegistry?: InteractionRegistry,
  unitRegistry?: UnitRegistry
) => Moved[] = (
  interactionRegistry: InteractionRegistry = interactionRegistryInstance,
  unitRegistry: UnitRegistry = unitRegistryInstance
): Moved[] => {
  const { canMakeContact, besideAnother, makeContact } = contactOnMove(
    interactionRegistry,
    unitRegistry
  );

  return [
    new Moved(
      // Barbarians make contact with no one (civ-clone/web-renderer#169).
      new Criterion(canMakeContact),
      new Criterion(besideAnother),
      new Effect(makeContact)
    ),
  ];
};

export default getRules;
