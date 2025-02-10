import { Avatars } from './avatars.enum';
import { BonusDice } from './dice';

interface Player {
    name: string;
    avatar: Avatars;
    life: number;
    speed: number;
    attack: number;
    defense: number;
    bonusDice: BonusDice;
    movement: number;
    action: number;
}

type PointStat = 'life' | 'speed' | 'attack' | 'defense';

const statFrench = {
    life: 'vie',
    speed: 'vitesse',
    attack: 'attaque',
    defense: 'defense',
};

export { Player, PointStat, statFrench };
