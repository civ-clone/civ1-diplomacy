import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import Declaration from '@civ-clone/core-diplomacy/Declaration';
import Effect from '@civ-clone/core-rule/Effect';
import Expired from '@civ-clone/core-diplomacy/Rules/Declaration/Expired';

export const getRules = (engine: Engine = engineInstance): Expired[] => [
  new Expired(
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
