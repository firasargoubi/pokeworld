import { CombatAction, CombatData, PlayerCombatData } from '../interfaces/match-data';
import { TileType } from '../interfaces/tile-type.enum';
import { DEFAULT_PLAYER_DATA } from './player-data.const';

export const PATH_ATTACK_MODIFICATION = -2;
export const PATH_DEFENSE_MODIFICATION = -2;

export const COMBAT_TURN_DURATION = 5000;
export const COMBAT_SHORT_TURN_DURATION = 3000;
export const COMBAT_ANIMATION_DURATION = 500;
export const COMBAT_END_DURATION = 2000;
export const COMBAT_BOT_DURATION = 500;

export const DEFAULT_ATTACK = 4;
export const DEFAULT_DEFENSE = 4;
export const DEFAULT_ESCAPES = 2;
export const DEFAULT_ESCAPE_CHANCES = 0.3;

export const ITEM1_ATTACK_BONUS = 1;
export const ITEM1_DEFENSE_BONUS = 1;

export const ITEM2_ATTACK_BONUS = 2;
export const ITEM2_DEFENSE_BONUS = 2;

export const ITEM3_BUSH_ATTACK_BONUS = 3;

export const ITEM5_MAX_ESCAPES_BONUS = 1;
export const ITEM5_CURRENT_ESCAPES_BONUS = 1;
export const ITEM5_ESCAPE_CHANCES_BONUS = 0.2;

export const HEALING_ITEM_RATIO = 0.5;
export const ITEM4_HEALING_BONUS = 1;

export const DEFAULT_PLAYER_COMBAT_DATA: PlayerCombatData = {
    playerIndex: 0,
    currentHealth: DEFAULT_PLAYER_DATA.health,
    currentEscapes: DEFAULT_ESCAPES,
    maxEscapes: DEFAULT_ESCAPES,
    escapeChances: DEFAULT_ESCAPE_CHANCES,
    attack: DEFAULT_ATTACK,
    defense: DEFAULT_DEFENSE,
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
