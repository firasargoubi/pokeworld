import { GameData } from './game-data';
import { PlayerData } from './player-data';
import { TileType } from './tile-type.enum';

export interface MatchData {
    code: string;
    state: MatchState;
    gameData: GameData;
    lobbyData: LobbyData;
    playData: PlayData;
    combatData: CombatData;
    players: PlayerData[];
}

export interface LobbyData {
    isLocked: boolean;
    hostPlayerIndex: number;
}

export interface PlayData {
    timeLeft: number;
    isDebugMode: boolean;
    activePlayerIndex: number;
    hasAction: boolean;
    movementLeft: number;
}

export interface CombatData {
    lastCombatAction: CombatAction;
    turnDuration: number;
    isSecondPlayerTurn: boolean;
    playersCombatData: PlayerCombatData[];
    lastRolledAttack: number;
    lastRolledDefense: number;
}

export interface PlayerCombatData {
    playerIndex: number;
    currentHealth: number;
    currentEscapes: number;
    maxEscapes: number;
    attack: number;
    defense: number;
    standingTile: TileType;
}

export enum CombatAction {
    None = 'none',
    SuccessAttack = 'successAttack',
    FailAttack = 'failAttack',
    SuccessEscape = 'successEscape',
    FailEscape = 'failEscape',
}

export enum MatchState {
    Lobby = 'lobby',
    TurnStart = 'turnStart',
    TurnWait = 'turnWait',
    MovementAnimation = 'movementAnimation',
    CombatWait = 'combatWait',
    CombatAnimation = 'combatAnimation',
    CombatEnd = 'combatEnd',
    MatchEnd = 'matchEnd',
    Statistics = 'statistics',
}
