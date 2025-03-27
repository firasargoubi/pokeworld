import { ItemType } from './item-type.enum';
import { Position } from './position';

export enum DiceType {
    D4 = 4,
    D6 = 6,
}

export enum Avatar {
    Default = 'default',
    Avatar1 = 'avatar1',
    Avatar2 = 'avatar2',
    Avatar3 = 'avatar3',
    Avatar4 = 'avatar4',
    Avatar5 = 'avatar5',
    Avatar6 = 'avatar6',
    Avatar7 = 'avatar7',
    Avatar8 = 'avatar8',
    Avatar9 = 'avatar9',
    Avatar10 = 'avatar10',
    Avatar11 = 'avatar11',
    Avatar12 = 'avatar12',
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
    position: Position;
    fightsWon: number;
    type: PlayerType;
}

export enum PlayerType {
    Player = 'player',
    BotOffensive  = 'botOffensive',
    BotDefensive = 'botDefensive',
}
