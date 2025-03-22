import { Avatar } from './avatar.enum';
import { DiceType } from './dice';
import { ItemType } from './item-type.enum';
import { Position } from './position';

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
