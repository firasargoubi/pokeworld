import { Avatar } from './player-data';
import { MenuMusicVariant, PartyBallVariant } from './preferences';

export enum ShopItemType {
    Button = 'button',
    Music = 'music',
    Pokemon = 'pokemon',
}

export interface ShopItem {
    id: string;
    nameKey: string;
    price: number;
    type: ShopItemType;
    variant?: PartyBallVariant | MenuMusicVariant | Avatar;
}

export interface InventoryItem {
    itemId: string;
    price: number;
}
