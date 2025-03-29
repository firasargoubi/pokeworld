import { CombatAction, CombatData, PlayerCombatData } from '../interfaces/match-data';
import { TileType } from '../interfaces/tile-type.enum';

export const COMBAT_TURN_DURATION = 5000;
export const COMBAT_SHORT_TURN_DURATION = 3000;
export const COMBAT_ANIMATION_DURATION = 500;
export const COMBAT_END_DURATION = 3000;

export const ESCAPE_CHANCES = 0.3;

export const DEFAULT_ATTACK = 4;

export const DEFAULT_DEFENSE = 4;

export const DEFAULT_ESCAPES = 2;

export const PATH_ATTACK_MODIFICATION = -2;
export const PATH_DEFENSE_MODIFICATION = -2;

export const DEFAULT_PLAYER_COMBAT_DATA: PlayerCombatData = {
    playerIndex: 0,
    currentHealth: 4,
    currentEscapes: 2,
    maxEscapes: 2,
    attack: 4,
    defense: 4,
    standingTile: TileType.Grass,
};

export const DEFAULT_COMBAT_DATA: CombatData = {
    lastCombatAction: CombatAction.None,
    turnDuration: COMBAT_TURN_DURATION,
    isSecondPlayerTurn: false,
    playersCombatData: [structuredClone(DEFAULT_PLAYER_COMBAT_DATA), structuredClone(DEFAULT_PLAYER_COMBAT_DATA)],
    lastRolledAttack: 0,
    lastRolledDefense: 0,
};
