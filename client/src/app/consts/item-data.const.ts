/* eslint-disable @typescript-eslint/no-magic-numbers */
// Magic numbers are used to define the maximum number of items for each map size

import { ItemType } from '@common/interfaces/item-type.enum';
import { MapSize } from '@common/interfaces/map-data';

export const ITEM_DESCRIPTION: Map<ItemType, string> = new Map([
    [ItemType.Item1, '<b>Shiny Charm</b> Rend shiny (+1 ATT / +1 DEF)'],
    [ItemType.Item2, '<b>Evo Gem</b> Évolution (+2 ATT / +2 DEF)'],
    [ItemType.Item3, '<b>Bush Boost</b> +3 ATT en buisson'],
    [ItemType.Item4, '<b>Healing Berry</b> +1 HP/tour si PV ≤ 50%'],
    [ItemType.Item5, '<b>Phantom Cloak</b> +30% évasion, +1 nb évasion'],
    [ItemType.Item6, '<b>Invisibility Mantle</b> Joueur invisible'],
    [ItemType.Random, '<b>Item Aléatoire</b> Donne aléatoirement 1 des 6 items'],
    [ItemType.Spawn, '<b>Point de départ</b> Point de départ des joueurs'],
    [ItemType.Flag, '<b>Drapeau</b> Objectif de capture (CTF)'],
]);

export const MAX_ITEM_COUNT: Record<MapSize, Record<ItemType, number>> = {
    [MapSize.Small]: {
        [ItemType.Item1]: 1,
        [ItemType.Item2]: 1,
        [ItemType.Item3]: 1,
        [ItemType.Item4]: 1,
        [ItemType.Item5]: 1,
        [ItemType.Item6]: 1,
        [ItemType.Random]: 2,
        [ItemType.Spawn]: 2,
        [ItemType.Flag]: 0,
    },
    [MapSize.Medium]: {
        [ItemType.Item1]: 1,
        [ItemType.Item2]: 1,
        [ItemType.Item3]: 1,
        [ItemType.Item4]: 1,
        [ItemType.Item5]: 1,
        [ItemType.Item6]: 1,
        [ItemType.Random]: 4,
        [ItemType.Spawn]: 4,
        [ItemType.Flag]: 0,
    },
    [MapSize.Large]: {
        [ItemType.Item1]: 1,
        [ItemType.Item2]: 1,
        [ItemType.Item3]: 1,
        [ItemType.Item4]: 1,
        [ItemType.Item5]: 1,
        [ItemType.Item6]: 1,
        [ItemType.Random]: 6,
        [ItemType.Spawn]: 6,
        [ItemType.Flag]: 0,
    },
};
