import { Avatars } from './avatars.enum';
import { ItemType } from './item-type.enum';
import { Position } from './position';
import { DiceType } from './dice';
import { TileType } from './tile-type.enum';


export interface Player {
    id: string;
    name: string;
    avatar: Avatars;
    playerStats: PlayertStats;
    currentStats: CurrentStats;
    isAdmin: boolean;
    isConnected: boolean;
}

export interface PlayertStats {
    health: number;
    speed: number;
    attack: number;
    defense: number;
    attackDice: DiceType;
    defenseDice: DiceType;
    escapes: number;
}

export interface CurrentStats {
    health: number;
    speed: number;
    attack: number;
    defense: number;
    escapes: number;
    attackBonus: number;
    defenseBonus: number;
    items: ItemType[];
    action: number;
    position: Position;
    tileType: TileType
}
