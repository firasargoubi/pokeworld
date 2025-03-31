import { MapSize } from '../interfaces/map-data';
import { Avatar, DiceType, PlayerData, PlayerType } from '../interfaces/player-data';

export const DEFAULT_PLAYER_DATA: PlayerData = {
    id: '',
    name: '',
    avatar: Avatar.Default,
    isConnected: false,
    spawnPoint: { x: -2, y: -2 },
    items: [],
    health: 6,
    speed: 4,
    attackDice: DiceType.D6,
    defenseDice: DiceType.D4,
    position: { x: -2, y: -2 },
    combatsWon: 0,
    type: PlayerType.Player,
};

export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 20;
export const DEFAULT_STAT = 4;
export const BONUS_STAT = 6;

export const MOVE_ANIMATION_DURATION = 150;

export const MIN_PLAYERS = 2;

export const MAX_PLAYERS = {
    [MapSize.Small]: 2,
    [MapSize.Medium]: 4,
    [MapSize.Large]: 6,
};
