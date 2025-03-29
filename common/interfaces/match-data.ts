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
    isFirstPlayerTurn: boolean;
    firstPlayer: PlayerCombatData;
    secondPlayer: PlayerCombatData;
}

export interface PlayerCombatData {
    playerIndex: number;
    playerData: PlayerData;
    currentHealth: number;
    currentEscapes: number;
    maxEscapes: number;
    attack: number;
    defense: number;
    standingTile: TileType;
    lastRolledAttack: number;
    lastRolledDefense: number;
}

export enum CombatAction {
    None = 'none',
    Attack = 'attack',
    Escape = 'Escape',
}

export enum MatchState {
    Lobby = 'lobby',
    TurnStart = 'turnStart',
    TurnWait = 'turnWait',
    MovementAnimation = 'movementAnimation',
    ItemDropSelection = 'itemDropSelection',  
    CombatWait = 'combatAnimation',
    CombatAnimation = 'combatAnimation',
    CombatEnd = 'combatEnd',
    MatchEnd = 'matchEnd',
}
