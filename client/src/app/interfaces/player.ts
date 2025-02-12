import { Avatars } from './avatars.enum';

export interface Player {
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
