import { Avatars } from './avatars.enum';

const DEFAULT_STAT_POINTS = 4;
const BONUS_POINTS = 2;
enum Dice {
    D6 = '⚅',
    D4 = '⚃',
}

interface Player {
    name: string;
    avatar: Avatars;
    life: number;
    speed: number;
    attack: number;
    defense: number;
    bonusDice: { attack: Dice; defense: Dice };
    movement: number;
    action: number;
}

const DEFAULT_PLAYER: Player = {
    name: '',
    avatar: Avatars.Default,
    life: DEFAULT_STAT_POINTS,
    speed: DEFAULT_STAT_POINTS,
    attack: DEFAULT_STAT_POINTS,
    defense: DEFAULT_STAT_POINTS,
    bonusDice: { attack: Dice.D4, defense: Dice.D6 },
    movement: 0,
    action: 0,
};

type PointStat = 'life' | 'speed' | 'attack' | 'defense';

export { BONUS_POINTS, Dice, Player, DEFAULT_PLAYER, DEFAULT_STAT_POINTS, PointStat };
