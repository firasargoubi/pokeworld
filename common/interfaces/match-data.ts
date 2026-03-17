import { ChatLog, ChatMessage } from './chat-message';
import { GameData } from './game-data';
import { PlayerData, PlayerType } from './player-data';
import { Position } from './position';
import { TileType } from './tile-type.enum';
import { TrackingPlayerData, WinnerData } from './track-data';

export interface MatchData {
    code: string;
    state: MatchState;
    gameData: GameData;
    lobbyData: LobbyData;
    playData: PlayData;
    combatData: CombatData;
    trackingData: TrackingData;
    players: PlayerData[];
    chatData: ChatMessage[];
    logData: ChatLog[];
}

export interface LobbyData {
    isLocked: boolean;
    hostPlayerIndex: number;
    isDropInEnabled: boolean;
}

export interface PlayData {
    timeLeft: number;
    isDebugMode: boolean;
    activePlayerIndex: number;
    hasAction: boolean;
    movementLeft: number;
    isElementalMode: boolean;
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
    name?: string;
    currentHealth: number;
    currentEscapes: number;
    maxEscapes: number;
    escapeChances: number;
    attack: number;
    defense: number;
    standingTile: TileType;
    profilePicture?: string;
    fullProfilePicture?: string;
}

export interface TrackingData {
    startTime: number;
    endTime: number;
    coveredBridges: Position[];
    coveredGroundTiles: Position[];
    rounds: number;
    flagHoldersCount: number;
    matchWinner: WinnerData;
    players: TrackingPlayerData[];
}
export interface SpectatorPanelData {
    playerIndex: number;
    name: string;
    profilePicture: string;
    playerType: PlayerType;
    attack: number;
    attackDice: number;
    defense: number;
    defenseDice: number;
    speed: number;
    currentHealth: number;
    maxHealth: number;
}

export interface MatchSettings {
    isElementalMode: boolean;
    isDropInEnabled: boolean;
    isRapidElimination: boolean;
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
    ItemWait = 'itemDropSelection',
    CombatWait = 'combatWait',
    CombatAnimation = 'combatAnimation',
    CombatEnd = 'combatEnd',
    MatchEnd = 'matchEnd',
    Statistics = 'statistics',
}
