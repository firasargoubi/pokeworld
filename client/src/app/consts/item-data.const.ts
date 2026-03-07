import { ItemType } from '@common/interfaces/item-type.enum';

export const RIGHT_CLICK_ITEM_DESCRIPTION: Map<ItemType, string> = new Map([
    [ItemType.Item1, 'items.rightClick.item1'],
    [ItemType.Item2, 'items.rightClick.item2'],
    [ItemType.Item3, 'items.rightClick.item3'],
    [ItemType.Item4, 'items.rightClick.item4'],
    [ItemType.Item5, 'items.rightClick.item5'],
    [ItemType.Item6, 'items.rightClick.item6'],
    [ItemType.Random, 'items.rightClick.random'],
    [ItemType.Spawn, 'items.rightClick.spawn'],
    [ItemType.Flag, 'items.rightClick.flag'],
]);

export const ITEM_DESCRIPTION: Map<ItemType, string> = new Map([
    [ItemType.Item1, 'items.description.item1'],
    [ItemType.Item2, 'items.description.item2'],
    [ItemType.Item3, 'items.description.item3'],
    [ItemType.Item4, 'items.description.item4'],
    [ItemType.Item5, 'items.description.item5'],
    [ItemType.Item6, 'items.description.item6'],
    [ItemType.Random, 'items.description.random'],
    [ItemType.Spawn, 'items.description.spawn'],
    [ItemType.Flag, 'items.description.flag'],
]);
