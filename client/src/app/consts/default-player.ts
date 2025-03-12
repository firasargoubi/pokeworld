import { DiceType } from '@app/consts/dice';
import { Avatars } from '@common/avatars.enum';

const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 20;
const DEFAULT_STAT_POINTS = 4;
const BONUS_POINTS = 2;

const DEFAULT_PLAYER = {
    name: '',
    avatar: Avatars.Default,
    life: DEFAULT_STAT_POINTS,
    speed: DEFAULT_STAT_POINTS,
    attack: DEFAULT_STAT_POINTS,
    defense: DEFAULT_STAT_POINTS,
    bonusDice: { attack: DiceType.D4, defense: DiceType.D6 },
};

export { BONUS_POINTS, DEFAULT_PLAYER, DEFAULT_STAT_POINTS, MAX_NAME_LENGTH, MIN_NAME_LENGTH };
