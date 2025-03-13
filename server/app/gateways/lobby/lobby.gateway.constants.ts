import { Avatars } from '@common/avatars.enum';
import { MapSize } from '@common/map-size.enum';
import { Player } from '@common/player';

export const NEW_PLAYER: Player = {
    id: '',
    name: '',
    avatar: Avatars.Default,
    playerStats: {
        health: 0,
        speed: 0,
        attack: 0,
        defense: 0,
        attackDice: '',
        defenseDice: '',
    },
    currentStats: {
        health: 0,
        items: [],
        position: { x: 0, y: 0 },
        speed: 0,
        action: 3,
    },
    isAdmin: false,
    isConnected: false,
};

export const CODE_RANGE = 10000;
export const CODE_LENGTH = 4;

export const MIN_PLAYERS = 2;

export const MAX_PLAYERS = {
    [MapSize.Small]: 2,
    [MapSize.Medium]: 4,
    [MapSize.Large]: 6,
};
