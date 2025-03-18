import { Match, MatchData, TurnPhase } from '../interfaces/match';
import { MOCK_GAME_DATAS } from './mock-games';
import { MOCK_PLAYERS, PLAYER_IDS } from './mock-players';

export const MOCK_MATCH_DATAS: MatchData[] = [
    {
        code: '1111',
        isDebugMode: false,
        isStarted: false,
        isLocked: false,
        activePlayer: 0,
        players: structuredClone(MOCK_PLAYERS),
        phase: TurnPhase.PreTurn,
        currentTimer: 0,
        maxTimer: 0,
    },
    {
        code: '2222',
        isDebugMode: false,
        isStarted: true,
        isLocked: true,
        activePlayer: 0,
        players: structuredClone(MOCK_PLAYERS),
        phase: TurnPhase.PreTurn,
        currentTimer: 0,
        maxTimer: 0,
    },
    {
        code: '3333',
        isDebugMode: true,
        isStarted: true,
        isLocked: true,
        activePlayer: 0,
        players: structuredClone(MOCK_PLAYERS),
        phase: TurnPhase.PreTurn,
        currentTimer: 0,
        maxTimer: 0,
    },
];

export const MOCK_MATCHES: Match[] = [
    {
        matchData: structuredClone(MOCK_MATCH_DATAS[0]),
        gameData: structuredClone(MOCK_GAME_DATAS[0]),
    },
    {
        matchData: structuredClone(MOCK_MATCH_DATAS[1]),
        gameData: structuredClone(MOCK_GAME_DATAS[1]),
    },
    {
        matchData: structuredClone(MOCK_MATCH_DATAS[2]),
        gameData: structuredClone(MOCK_GAME_DATAS[2]),
    },
];

export const MATCH_CODES = ['1111', '2222'];

export const MATCHES: Map<string, Match> = new Map([
    [MATCH_CODES[0], MOCK_MATCHES[0]],
    [MATCH_CODES[1], MOCK_MATCHES[1]],
]);

export const PLAYER_TO_MATCH_CODE: Map<string, string> = new Map([
    [PLAYER_IDS[0], MATCH_CODES[0]],
    [PLAYER_IDS[1], MATCH_CODES[0]],
    [PLAYER_IDS[2], MATCH_CODES[1]],
    [PLAYER_IDS[3], MATCH_CODES[1]],
]);
