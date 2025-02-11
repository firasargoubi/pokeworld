import { Avatars } from './avatars.enum';

interface Player {
    name: string;
    avatar: Avatars;
    life: number;
    speed: number;
    attack: number;
    defense: number;
    bonusDice: { attack: string; defense: string };
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
