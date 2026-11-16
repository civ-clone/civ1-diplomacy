# civ1-diplomacy

Civilization's diplomacy (v474.05), as rules on `base-diplomacy`, under `civ1-diplomacy:` ids. The numbers come from
the original's code (OpenCivOne's decompile, cited in each rule).

- **Contact:** units next to another player's units make contact (`Rules/Unit/moved`).
- **Meetings** (`Rules/Negotiation/step`): led by the computer player, with v474.05's order and numbers: a welcome, an
  exchange of knowledge, tribute in gold or an advance, a peace offer (sweetened with an advance or gold when it's
  refused), a call to cancel a treaty with a third player, and war. A person answers; after the hand-over at peace, a
  person may demand tribute. How often players meet (`Rules/Player/may-negotiate`): a computer player and a person 16
  turns after they last met, or 32 after a treaty was signed; two computer players at first contact, then about one
  turn in four while their units are next to each other.
- **What is agreed** (`Rules/Proposal/resolved`): peace, tribute paid, a treaty with a third player cancelled, advances
  exchanged (`AdvanceTaken` records what a computer player took), war, and peace between computer players.
- **Treaties:** `Peace` and `War` (re-exported from base-diplomacy's declarations in `Declarations`). Any two players
  who have met without a peace are at war. A computer player keeping a peace it means to break drops it one turn in
  three, without a word (`Rules/Player/turn-start`); a treaty ended is announced to both players
  (`Rules/Declaration/expired`, `player:declaration-expired`).
- **Vendettas:** everyone with a unit or a city under a nuclear strike holds it against the player who launched it
  (`Rules/Unit/detonated`).
- **Thefts:** a city's record of the advances stolen from it is forgotten when it's captured (`Rules/City/captured`).

A person can't open talks or make proposals of their own in Civilization; the generic pieces in base-diplomacy that
Civilization II's rules use for that aren't registered here (civ-clone/web-renderer#1071).
