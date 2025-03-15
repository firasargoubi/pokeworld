import { GameData } from './game-data';
import { Player } from './player';

export interface Match {
    matchData: MatchData;
    gameData: GameData;
}

export interface MatchData {
    code: string;
    phase: TurnPhase;
    currentTimer: number;
    maxTimer: number;
    isLocked: boolean;
    isStarted: boolean;
    isDebugMode: boolean;
    activePlayer: number;
    players: Player[];
}

export enum TurnPhase {
    PreTurn = 'preTurn',
    Turn = 'turn',
    WaitingForCombat = 'waitingForCombat',
}