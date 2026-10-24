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
import Player from '@civ-clone/core-player/Player';
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
    // `by` is the player who ended it, if one did (civ-clone/web-renderer#641): whoever breaks a treaty isn't told
    //  they've been attacked.
    new Effect((declaration: Declaration, by: Player | null = null) => {
      engine.emit('diplomacy:declaration-expired', declaration, by);

      declaration
        .players()
        .forEach((player) =>
          engine.emit('player:declaration-expired', player, declaration, by)
        );
    })
  ),
];

export default getRules;
