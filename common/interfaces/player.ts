import { Avatar } from './avatar.enum';
import { DiceType } from './dice';
import { ItemType } from './item-type.enum';
import { Position } from './position';
import { TileType } from './tile-type.enum';

export interface Player {
    id: string;
    name: string;
    avatar: Avatar;
    playerStats: PlayertStats;
    currentStats: CurrentStats;
    isAdmin: boolean;
    isConnected: boolean;
    isBot: boolean;
    spawnPoint: Position;
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
    items: ItemType[];
    position: Position;
    movement: number;
    hasAction: boolean;
    fightsWon: number;
    health: number;
    attack: number;
    defense: number;
    speed: number;
    attackBonus: number;
    defenseBonus: number;
    escapes: number;
    standingTile: TileType;
}

export enum StatType {
    Life = 'life',
    Speed = 'speed',
    Attack = 'attack',
    Defense = 'defense',
}
