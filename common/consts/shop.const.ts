import { ShopItem } from '@common/interfaces/shop';

export const INITIAL_USER_BALANCE = 5000;

export const MATCH_BALANCE_REWARDS = {
    win: 5000,
    draw: 3000,
    loss: 1000,
} as const;

export const SHOP_ITEMS: ShopItem[] = [
    { id: 'shop-item-1', nameKey: 'components.shopPopup.items.item1', price: 1000 },
    { id: 'shop-item-2', nameKey: 'components.shopPopup.items.item2', price: 2000 },
    { id: 'shop-item-3', nameKey: 'components.shopPopup.items.item3', price: 3000 },
    { id: 'shop-item-4', nameKey: 'components.shopPopup.items.item4', price: 4000 },
    { id: 'shop-item-5', nameKey: 'components.shopPopup.items.item5', price: 5000 },
];
