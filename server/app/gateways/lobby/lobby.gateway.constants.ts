import { Avatars } from '@common/avatars.enum';
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
    isConnected: true,
};

export const CODE_RANGE = 10000;
export const CODE_LENGTH = 4;
export const MAX_PLAYERS = 5;
