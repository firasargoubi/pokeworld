import { CombatData, LobbyData, MatchData, MatchState, PlayData } from '../interfaces/match-data';
import { DEFAULT_GAME_DATA } from './game-data.const';

export const TURN_DURATION = 30000;

export const DEFAULT_LOBBY_DATA: LobbyData = {
    isLocked: false,
    adminPlayerIndex: 0,
};

export const DEFAULT_PLAY_DATA: PlayData = {
    timeLeft: TURN_DURATION,
    activePlayer: 0,
    isDebugMode: false,
};

export const DEFAULT_COMBAT_DATA: CombatData = {
    firstPlayerIndex: 0,
    seccondPlayerIndex: 0,
};

export const DEFAULT_MATCH_DATA: MatchData = {
    code: '',
    state: MatchState.Lobby,
    gameData: DEFAULT_GAME_DATA,
    lobbyData: DEFAULT_LOBBY_DATA,
    playData: DEFAULT_PLAY_DATA,
    combatData: DEFAULT_COMBAT_DATA,
    players: [],
};

export const CODE_RANGE = 10000;

export const CODE_LENGTH = 4;

export const HALF_POINT = 0.5;

export const MATCH_END_DELAY = 4000;

export const PRE_TURN_DURATION = 3000;

export const MS_CONVERSION_FACTOR = 10;

export const MINIMUM_FIGHTS_TO_WIN = 3;
