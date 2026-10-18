import { IInteraction } from '@civ-clone/core-diplomacy/Interaction';
import Dependencies from '../../lib/Dependencies';
import Effect from '@civ-clone/core-rule/Effect';
import Interaction from '@civ-clone/core-diplomacy/Rules/Negotiation/Interaction';
import Negotiation from '@civ-clone/core-diplomacy/Negotiation';
import Never from '@civ-clone/core-diplomacy/Expiries/Never';
import Peace from '@civ-clone/base-diplomacy-declaration-peace/Peace';
import ShamPeace from '@civ-clone/library-diplomacy/Declarations/ShamPeace';
import Terminate from '@civ-clone/core-diplomacy/Negotiation/Terminate';
import { activeDeclarations } from '../../lib/declareWar';
import { heldBy } from '@civ-clone/library-diplomacy/lib/holds';
import { knownMeeting } from '../../lib/meeting';

export const getRules = (dependencies: Dependencies): Interaction[] => [
  new Interaction(
    'civ1-diplomacy:negotiation/interaction/register',
    new Effect((interaction: IInteraction): void =>
      dependencies.interactionRegistry.register(interaction)
    )
  ),

  // A computer player that backed off from a treaty partner it wanted to threaten keeps the peace for now, and means
  //  to drop it (`MeetWithKing.cs` L644-660, flag 0x100).
  new Interaction(
    'civ1-diplomacy:negotiation/interaction/sham-peace',
    new Effect((interaction: IInteraction, negotiation: Negotiation): void => {
      const meeting = knownMeeting(negotiation);

      if (
        !(interaction instanceof Terminate) ||
        meeting === null ||
        !meeting.stance.sham ||
        activeDeclarations(dependencies, Peace, meeting.player, meeting.other)
          .length === 0 ||
        heldBy(
          ShamPeace,
          meeting.player,
          meeting.other,
          dependencies.interactionRegistry
        ) !== null
      ) {
        return;
      }

      dependencies.interactionRegistry.register(
        new ShamPeace(
          meeting.player,
          meeting.other,
          new Never(),
          dependencies.ruleRegistry
        )
      );
    })
  ),
];

export default getRules;
