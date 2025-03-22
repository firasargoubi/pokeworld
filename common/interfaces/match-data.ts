import { GameData } from './game-data';
import { PlayerData } from './player-data';

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
    activePlayerIndex: number;
    isDebugMode: boolean;
}

export interface CombatData {
    firstPlayerIndex: number;
    seccondPlayerIndex: number;
}

export enum MatchState {
    Lobby = 'lobby',
    TurnStart = 'turnStart',
    TurnWait = 'turnWait',
    MovementAnimation = 'movementAnimation',
    CombatWait = 'combatAnimation',
    CombatAnimation = 'combatAnimation',
    CombatEnd = 'combatEnd',
    MatchEnd = 'matchEnd',
}
