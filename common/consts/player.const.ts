import { DiceType, PlayerData } from '../interfaces/player-data';
import { TileType } from '../interfaces/tile-type.enum';
import { Avatar } from '../interfaces/avatar.enum';
import { MapSize } from '../interfaces/map-data';

export const DEFAULT_PLAYER: PlayerData = {
    id: '',
    name: '',
    avatar: Avatar.Default,
    isConnected: false,
    spawnPoint: { x: 0, y: 0 },
    items: [],
    health: 6,
    speed: 4,
    attackDice: DiceType.D6,
    defenseDice: DiceType.D4,
};

export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 20;
export const DEFAULT_STAT_POINTS = 4;
export const DEFAULT_ESCAPE_POINTS = 2;
export const BONUS_POINTS = 2;

export const MOVE_ANIMATION_DURATION = 150;

export const MIN_PLAYERS = 2;

export const MAX_PLAYERS = {
    [MapSize.Small]: 2,
    [MapSize.Medium]: 4,
    [MapSize.Large]: 6,
};
