import { DiceType } from '../interfaces/dice';
import { Player } from '../interfaces/player';
import { TileType } from '../interfaces/tile-type.enum';
import { Avatar } from '../interfaces/avatar.enum';
import { MapSize } from '../interfaces/map-data';

export const DEFAULT_PLAYER: Player = {
    id: '',
    name: '',
    avatar: Avatar.Default,
    playerStats: {
        health: 6,
        speed: 4,
        attack: 4,
        defense: 4,
        attackDice: DiceType.D6,
        defenseDice: DiceType.D4,
        escapes: 2,
    },
    currentStats: {
        health: 6,
        speed: 4,
        attack: 4,
        defense: 4,
        escapes: 2,
        attackBonus: 0,
        defenseBonus: 0,
        items: [],
        position: { x: 0, y: 0 },
        movement: 0,
        hasAction: false,
        fightsWon: 0,
        standingTile: TileType.Grass,
    },
    isAdmin: false,
    isConnected: false,
    isBot: false,
    spawnPoint: { x: 0, y: 0 },
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
