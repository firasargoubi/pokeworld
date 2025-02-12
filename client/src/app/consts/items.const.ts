/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ItemType } from '@common/item-type.enum';
import { MapSize } from '@common/map-size.enum';

export const ITEM_DESCRIPTION: Map<ItemType, string> = new Map([
    [ItemType.Item1, '<b>Item 1</b>Description de item 1'],
    [ItemType.Item2, '<b>Item 2</b>Description de item 2'],
    [ItemType.Item3, '<b>Item 3</b>Description de item 3'],
    [ItemType.Item4, '<b>Item 4</b>Description de item 4'],
    [ItemType.Item5, '<b>Item 5</b>Description de item 5'],
    [ItemType.Item6, '<b>Item 6</b>Description de item 6'],
    [ItemType.Random, '<b>Item Aléatoire</b>Aléatoirement 1 des 6 items'],
    [ItemType.Spawn, '<b>Point de départ</b>Point de départ des joueurs'],
    [ItemType.Flag, '<b>Drapeau</b>Objectif de capture de CTF'],
]);

export const MAX_ITEM_COUNT: Record<MapSize, Record<ItemType, number>> = {
    [MapSize.Small]: {
        [ItemType.Item1]: 0,
        [ItemType.Item2]: 0,
        [ItemType.Item3]: 0,
        [ItemType.Item4]: 0,
        [ItemType.Item5]: 0,
        [ItemType.Item6]: 0,
        [ItemType.Random]: 0,
        [ItemType.Spawn]: 2,
        [ItemType.Flag]: 0,
    },
    [MapSize.Medium]: {
        [ItemType.Item1]: 0,
        [ItemType.Item2]: 0,
        [ItemType.Item3]: 0,
        [ItemType.Item4]: 0,
        [ItemType.Item5]: 0,
        [ItemType.Item6]: 0,
        [ItemType.Random]: 0,
        [ItemType.Spawn]: 4,
        [ItemType.Flag]: 0,
    },
    [MapSize.Large]: {
        [ItemType.Item1]: 0,
        [ItemType.Item2]: 0,
        [ItemType.Item3]: 0,
        [ItemType.Item4]: 0,
        [ItemType.Item5]: 0,
        [ItemType.Item6]: 0,
        [ItemType.Random]: 0,
        [ItemType.Spawn]: 6,
        [ItemType.Flag]: 0,
    },
};
