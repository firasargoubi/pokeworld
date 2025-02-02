import { Avatars } from './avatars.enum';

const DEFAULT_STAT_POINTS = 4;
const BONUS_POINTS = 2;
enum Dice {
    D6 = 'D6',
    D4 = 'D4',
}

interface Player {
    name: string;
    avatar: Avatars;
    life: number;
    speed: number;
    attack: number;
    defense: number;
    bonusDice: Dice;
    movement: number;
    action: number;
}

export { DEFAULT_STAT_POINTS, BONUS_POINTS, Dice, Player };
