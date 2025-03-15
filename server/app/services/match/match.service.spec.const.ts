import { MOCK_MATCHES } from '@app/consts/tests/mock-matches';
import { Match } from '@common/match';

export const MATCH_CODES = ['1111', '2222'];

export const PLAYER_IDS = ['3333', '4444', '5555', '6666'];

export const MACTHES: Map<string, Match> = new Map([
    [MATCH_CODES[0], MOCK_MATCHES[0]],
    [MATCH_CODES[1], MOCK_MATCHES[1]],
]);

export const PLAYER_TO_MATCH_CODE: Map<string, string> = new Map([
    [PLAYER_IDS[0], MATCH_CODES[0]],
    [PLAYER_IDS[1], MATCH_CODES[0]],
    [PLAYER_IDS[2], MATCH_CODES[1]],
    [PLAYER_IDS[3], MATCH_CODES[1]],
]);
