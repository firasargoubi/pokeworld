import { Avatar } from './avatar.enum';
import { ItemType } from './item-type.enum';
import { Position } from './position';

export enum DiceType {
    D4 = 4,
    D6 = 6,
}

export interface PlayerData {
    id: string;
    isConnected: boolean;
    name: string;
    avatar: Avatar;
    items: ItemType[];
    health: number;
    speed: number;
    attackDice: DiceType;
    defenseDice: DiceType;
    spawnPoint: Position;
}
