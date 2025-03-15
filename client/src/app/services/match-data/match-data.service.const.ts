import { MatchData, TurnPhase } from '@common/match';

export const DEFAULT_MATCH: MatchData = {
    code: '',
    isStarted: false,
    isDebugMode: false,
    isLocked: false,
    activePlayer: 0,
    players: [],
    maxTimer: 0,
    currentTimer: 0,
    phase: TurnPhase.PreTurn,
};
