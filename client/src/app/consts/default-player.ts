import { Player } from '@app/interfaces/player';
import { Avatars } from '@app/interfaces/avatars.enum';
import { Dice } from '@app/interfaces/dice';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 20;
const DEFAULT_STAT_POINTS = 4;
const BONUS_POINTS = 2;

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

export { DEFAULT_STAT_POINTS, BONUS_POINTS, DEFAULT_PLAYER, MIN_NAME_LENGTH, MAX_NAME_LENGTH };
