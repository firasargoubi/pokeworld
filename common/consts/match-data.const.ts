import { TileType } from '@common/interfaces/tile-type.enum';
import { CombatAction, CombatData, LobbyData, MatchData, MatchState, PlayData, PlayerCombatData } from '../interfaces/match-data';
import { DEFAULT_GAME_DATA } from './game-data.const';
import { DEFAULT_PLAYER_DATA } from './player-data.const';

export const TURN_WAIT_DURATION = 30000;
export const TURN_START_DURATION = 3000;
export const MOVEMENT_ANIMATION_DURATION = 150;

export const DEFAULT_LOBBY_DATA: LobbyData = {
    isLocked: false,
    hostPlayerIndex: 0,
};

export const DEFAULT_PLAY_DATA: PlayData = {
    timeLeft: TURN_WAIT_DURATION,
    activePlayerIndex: 0,
    isDebugMode: false,
    hasAction: false,
    movementLeft: 0,
};

export const DEFAULT_PLAYER_COMBAT_DATA: PlayerCombatData = {
    playerIndex: 0,
    currentHealth: 4,
    currentEscapes: 2,
    maxEscapes: 2,
    attack: 4,
    defense: 4,
    playerData: structuredClone(DEFAULT_PLAYER_DATA),
    standingTile: TileType.Grass,
    lastRolledAttack: 0,
    lastRolledDefense: 0,
};

export const DEFAULT_COMBAT_DATA: CombatData = {
    firstPlayer: structuredClone(DEFAULT_PLAYER_COMBAT_DATA),
    secondPlayer: structuredClone(DEFAULT_PLAYER_COMBAT_DATA),
    lastCombatAction: CombatAction.None,
    isFirstPlayerTurn: true,
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

export const MATCH_CODE_RANGE = 10000;

export const MATCH_CODE_LENGTH = 4;

export const HALF_POINT = 0.5;

export const MS_CONVERSION_FACTOR = 10;

export const MINIMUM_FIGHTS_TO_WIN = 3;
