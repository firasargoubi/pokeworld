import { MatchData, TurnPhase } from "../interfaces/match";

export const DEFAULT_MATCH_DATA: MatchData = {
    code: '',
    isLocked: false,
    isStarted: false,
    isDebugMode: false,
    activePlayer: 0,
    players: [],
    maxTimer: 0,
    currentTimer: 0,
    phase: TurnPhase.Turn,
};

export const CODE_RANGE = 10000;

export const CODE_LENGTH = 4;

export const HALF_POINT = 0.5;

export const MATCH_END_DELAY = 4000;

export const PRE_TURN_DURATION = 3000;

export const TURN_DURATION = 30000;

export const MS_CONVERSION_FACTOR = 10;

export const MINIMUM_FIGHTS_TO_WIN = 3;
