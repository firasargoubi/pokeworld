import { Avatar } from '@common/interfaces/avatar.enum';
import { DiceType } from '@common/interfaces/dice';
import { Player } from '@common/interfaces/player';

export const DEFAULT_PARTIAL_PLAYER: Partial<Player> = {
    name: '',
    avatar: Avatar.Default,
    playerStats: {
        health: 0,
        speed: 0,
        attack: 0,
        defense: 0,
        attackDice: DiceType.D4,
        defenseDice: DiceType.D6,
        escapes: 0,
    },
    isConnected: true,
};
