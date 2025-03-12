import { Avatars } from './avatars.enum';
import { ItemType } from './item-type.enum';
import { Position } from './position';

export interface Player {
    id: string;
    name: string;
    avatar: Avatars;
    playerStats: PlayertStats;
    currentStats: CurrentStats;
    isAdmin: boolean;
    isConnected: boolean;
    isBot: boolean;
}

export interface PlayertStats {
    health: number;
    speed: number;
    attack: number;
    defense: number;
    attackDice: string;
    defenseDice: string;
}

export interface CurrentStats {
    health: number;
    items: ItemType[];
    position: Position;
    movement: number;
    action: boolean;
    fightsWon: number;
}
