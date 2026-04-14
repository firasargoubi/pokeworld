import { Avatar } from '@common/interfaces/player-data';
import { MenuMusicVariant, PartyBallVariant } from '@common/interfaces/preferences';
import { ShopItem, ShopItemType } from '@common/interfaces/shop';

export const INITIAL_USER_BALANCE = 5000;
export const PARTY_BALL_SHOP_ITEM_ID = 'party-ball';

export const MATCH_BALANCE_REWARDS = {
    win: 5000,
    draw: 3000,
    loss: 1000,
} as const;

export const SHOP_ITEMS: ShopItem[] = [
    { id: 'party-ball', nameKey: 'components.shopPopup.items.partyBall1', price: 1000, type: ShopItemType.Button, variant: PartyBallVariant.One },
    { id: 'party-ball-2', nameKey: 'components.shopPopup.items.partyBall2', price: 2000, type: ShopItemType.Button, variant: PartyBallVariant.Two },
    { id: 'party-ball-3', nameKey: 'components.shopPopup.items.partyBall3', price: 3000, type: ShopItemType.Button, variant: PartyBallVariant.Three },
    { id: 'party-ball-4', nameKey: 'components.shopPopup.items.partyBall4', price: 4000, type: ShopItemType.Button, variant: PartyBallVariant.Four },
    { id: 'menu-music-1', nameKey: 'components.shopPopup.items.menuMusic1', price: 1000, type: ShopItemType.Music, variant: MenuMusicVariant.One },
    { id: 'menu-music-2', nameKey: 'components.shopPopup.items.menuMusic2', price: 2000, type: ShopItemType.Music, variant: MenuMusicVariant.Two },
    { id: 'menu-music-3', nameKey: 'components.shopPopup.items.menuMusic3', price: 3000, type: ShopItemType.Music, variant: MenuMusicVariant.Three },
    { id: 'avatar13', nameKey: 'components.shopPopup.items.avatar13', price: 5000, type: ShopItemType.Pokemon, variant: Avatar.Avatar13 },
    { id: 'avatar14', nameKey: 'components.shopPopup.items.avatar14', price: 5000, type: ShopItemType.Pokemon, variant: Avatar.Avatar14 },
    { id: 'avatar15', nameKey: 'components.shopPopup.items.avatar15', price: 5000, type: ShopItemType.Pokemon, variant: Avatar.Avatar15 },
];
