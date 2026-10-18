import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  InteractionRegistry,
  instance as interactionRegistryInstance,
} from '@civ-clone/core-diplomacy/InteractionRegistry';
import Criterion from '@civ-clone/core-rule/Criterion';
import Declaration from '@civ-clone/core-diplomacy/Declaration';
import Effect from '@civ-clone/core-rule/Effect';
import Expired from '@civ-clone/core-diplomacy/Rules/Declaration/Expired';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';

export const getRules = (
  engine: Engine = engineInstance,
  interactionRegistry: InteractionRegistry = interactionRegistryInstance
): Expired[] => [
  new Expired(
    'civ1-diplomacy:declaration/expired/announce',
    // A peace dropped by a player that only pretended to keep it ends unannounced (`Rules/Player/turn-start`), as
    //  does the pretence itself.
    new Criterion(
      (declaration: Declaration): boolean =>
        !(declaration instanceof ShamPeace) &&
        !(
          declaration instanceof Peace &&
          interactionRegistry
            .getByPlayers(...declaration.players())
            .some(
              (interaction) =>
                interaction instanceof ShamPeace && interaction.active()
            )
        )
    ),
    new Effect((declaration: Declaration) => {
      engine.emit('diplomacy:declaration-expired', declaration);

      declaration
        .players()
        .forEach((player) =>
          engine.emit('player:declaration-expired', player, declaration)
        );
    })
  ),
];

export default getRules;
