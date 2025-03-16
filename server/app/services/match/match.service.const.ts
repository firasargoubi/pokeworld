import { MatchData } from '@common/match';

export const DEFAULT_MATCH_DATA: MatchData = {
    code: '',
    isLocked: false,
    isStarted: false,
    isDebugMode: false,
    activePlayer: 0,
    players: [],
};

export const CODE_RANGE = 10000;
export const CODE_LENGTH = 4;
