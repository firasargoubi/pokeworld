import { ItemType } from '@common/interfaces/item-type.enum';

export const ITEM_NAME: Record<ItemType, string> = {
    [ItemType.Item1]: 'Shiny Charm',
    [ItemType.Item2]: 'Evo Gem',
    [ItemType.Item3]: 'Bush Boost',
    [ItemType.Item4]: 'Healing Berry',
    [ItemType.Item5]: 'Phantom Cloak',
    [ItemType.Item6]: 'Invisibility Mantle',
    [ItemType.Random]: 'Item aléatoire',
    [ItemType.Spawn]: 'Point de départ',
    [ItemType.Flag]: 'Drapeau',
};
